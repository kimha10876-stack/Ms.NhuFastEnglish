using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace MsNhuFastEnglishAPI.Services;

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

    public Task SendOtpAsync(string toEmail, string fullName, string otp) =>
        SendAsync(toEmail, "Mã OTP đặt lại mật khẩu — Ms. Nhụ Fast English", $"""
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#007AFF">Xin chào {fullName},</h2>
              <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhập mã OTP bên dưới:</p>
              <div style="margin:28px 0;text-align:center">
                <span style="display:inline-block;font-size:40px;font-weight:700;letter-spacing:12px;
                  color:#1C1C1E;background:#F2F2F7;padding:16px 28px;border-radius:12px">
                  {otp}
                </span>
              </div>
              <p style="color:#636366;font-size:13px">Mã có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
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
