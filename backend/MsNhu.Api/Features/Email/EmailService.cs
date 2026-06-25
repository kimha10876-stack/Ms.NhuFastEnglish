using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace MsNhu.Api.Features.Email;

public class EmailService(IConfiguration config, ILogger<EmailService> logger)
{
    private readonly string _host      = config["Smtp:Host"]!;
    private readonly int    _port      = config.GetValue<int>("Smtp:Port", 587);
    private readonly string _username  = config["Smtp:Username"]!;
    private readonly string _password  = config["Smtp:Password"]!;
    private readonly string _fromEmail = config["Smtp:FromEmail"]!;
    private readonly string _fromName  = config["Smtp:FromName"] ?? "MsNhu English";

    public async Task SendWelcomeAsync(string toEmail, string fullName, string tempPassword)
    {
        var subject = "Chào mừng bạn đến với MsNhu English!";
        var body = $"""
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Tài khoản của bạn tại <strong>MsNhu English</strong> đã được tạo.</p>
            <table style="border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:4px 12px 4px 0;color:#8E8E93">Email</td>
                  <td style="padding:4px 0"><strong>{toEmail}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#8E8E93">Mật khẩu tạm</td>
                  <td style="padding:4px 0"><strong>{tempPassword}</strong></td></tr>
            </table>
            <p>Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.</p>
            <p style="color:#8E8E93;font-size:13px">MsNhu English — Trung tâm Anh ngữ</p>
            """;

        await SendAsync(toEmail, fullName, subject, body);
    }

    public async Task SendPasswordResetAsync(string toEmail, string fullName, string resetUrl)
    {
        var subject = "Đặt lại mật khẩu MsNhu English";
        var body = $"""
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>
              <a href="{resetUrl}"
                 style="display:inline-block;padding:10px 20px;background:#007AFF;
                        color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
                Đặt lại mật khẩu
              </a>
            </p>
            <p style="color:#8E8E93;font-size:13px">
              Link có hiệu lực trong <strong>15 phút</strong>.<br>
              Nếu bạn không yêu cầu, hãy bỏ qua email này.
            </p>
            """;

        await SendAsync(toEmail, fullName, subject, body);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_username, _password);
            await client.SendAsync(message);
            await client.DisconnectAsync(quit: true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Gửi email thất bại tới {Email}", toEmail);
            // Không throw — lỗi email không chặn flow chính
        }
    }
}
