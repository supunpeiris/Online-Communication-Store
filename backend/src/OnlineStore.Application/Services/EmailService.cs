using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using OnlineStore.Application.Interfaces;

namespace OnlineStore.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendOtpEmailAsync(string toEmail, string otp)
    {
        var email = new MimeMessage();
        string senderName = _config["Smtp:SenderName"] ?? "MyShop Store";
        string senderEmail = _config["Smtp:SenderEmail"] ?? "noreply@myshop.com";

        email.From.Add(new MailboxAddress(senderName, senderEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = "Your Store Registration OTP";

        string htmlBody = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                <tr>
                    <td align="center">
                        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 450px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <tr>
                                <td style="background-color: #3b82f6; padding: 32px 24px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to the Store!</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 32px; text-align: center;">
                                    <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.5;">
                                        Please use the verification code below to complete your registration process.
                                    </p>
                                    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 32px; display: inline-block; border: 1px dashed #cbd5e1;">
                                        <span style="font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px;">{otp}</span>
                                    </div>
                                    <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                                        This code will expire in <strong>10 minutes</strong>.
                                    </p>
                                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                                        If you didn't request this, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;

        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlBody };

        using var smtp = new SmtpClient();
        smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
        await smtp.ConnectAsync(_config["Smtp:Host"], int.Parse(_config["Smtp:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_config["Smtp:Username"], _config["Smtp:Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    public async Task SendPasswordResetOtpEmailAsync(string toEmail, string otp)
    {
        var email = new MimeMessage();
        string senderName = _config["Smtp:SenderName"] ?? "MyShop Store";
        string senderEmail = _config["Smtp:SenderEmail"] ?? "noreply@myshop.com";

        email.From.Add(new MailboxAddress(senderName, senderEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = "Password Reset Request";

        // Same design theme, tailored for password reset
        string htmlBody = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                <tr>
                    <td align="center">
                        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 450px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <tr>
                                <td style="background-color: #f97316; padding: 32px 24px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Password Reset</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 32px; text-align: center;">
                                    <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.5;">
                                        We received a request to reset your password. Please use the verification code below:
                                    </p>
                                    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 32px; display: inline-block; border: 1px dashed #cbd5e1;">
                                        <span style="font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px;">{otp}</span>
                                    </div>
                                    <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                                        This code will expire in <strong>10 minutes</strong>.
                                    </p>
                                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                                        If you didn't request a password reset, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;

        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlBody };

        using var smtp = new SmtpClient();
        smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
        await smtp.ConnectAsync(_config["Smtp:Host"], int.Parse(_config["Smtp:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_config["Smtp:Username"], _config["Smtp:Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
