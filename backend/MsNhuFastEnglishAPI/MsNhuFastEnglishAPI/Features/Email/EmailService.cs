using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace MsNhuFastEnglishAPI.Features.Email;

public class EmailService(IConfiguration config, ILogger<EmailService> logger)
{
    public Task SendWelcomeAsync(string toEmail, string fullName, string tempPassword) =>
        SendAsync(toEmail, "Chào mừng đến với Ms. Nhụ Fast English!", $"""
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#007AFF">Chào {fullName}!</h2>
              <p>Tài khoản của bạn đã được tạo thành công tại <strong>Ms. Nhụ Fast English</strong>.</p>
              <table style="border-collapse:collapse;width:100%;margin:20px 0">
                <tr><td style="padding:8px;background:#f5f5f7;font-weight:600">Email</td>
                    <td style="padding:8px;border:1px solid #e5e5ea">{toEmail}</td></tr>
                <tr><td style="padding:8px;background:#f5f5f7;font-weight:600">Mật khẩu</td>
                    <td style="padding:8px;border:1px solid #e5e5ea">{tempPassword}</td></tr>
              </table>
              <p style="color:#636366;font-size:13px">Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.</p>
            </div>
            """);

    public Task SendPasswordResetAsync(string toEmail, string fullName, string resetUrl) =>
        SendAsync(toEmail, "Đặt lại mật khẩu Ms. Nhụ Fast English", $"""
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#007AFF">Xin chào {fullName},</h2>
              <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
              <a href="{resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;
                 background:#007AFF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                Đặt lại mật khẩu
              </a>
              <p style="color:#636366;font-size:13px">Link có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            </div>
            """);

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                config["Smtp:FromName"] ?? "Ms. Nhụ Fast English",
                config["Smtp:FromEmail"]!));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body    = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                config["Smtp:Host"]!,
                config.GetValue<int>("Smtp:Port", 587),
                SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(config["Smtp:Username"]!, config["Smtp:Password"]!);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi gửi email tới {Email}", toEmail);
        }
    }
}
