namespace OnlineStore.Application.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string otp);
    Task SendPasswordResetOtpEmailAsync(string toEmail, string otp); // <-- Add this line
}
