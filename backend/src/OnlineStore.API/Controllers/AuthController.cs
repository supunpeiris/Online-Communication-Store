using Microsoft.AspNetCore.Mvc;
using OnlineStore.Application.DTOs.Auth;
using OnlineStore.Application.Interfaces;

namespace OnlineStore.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

               [HttpPost("request-otp")]
    public async Task<IActionResult> RequestOtp(RequestOtpDto dto)
    {
        try
        {
            await _authService.RequestOtpAsync(dto);
            return Ok(new { message = "OTP sent to email." });
        }
        catch (Exception ex) 
        { 
            // This will print the EXACT reason Brevo is failing in your terminal
            Console.WriteLine($"\n=== SMTP ERROR TRIGGERED ===\n{ex.Message}\n============================\n");

            if (ex.Message == "Email is already registered.") 
                return BadRequest(new { message = ex.Message });

            return BadRequest(new { message = "Failed to send OTP email. Please try again later." }); 
        }
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (Exception ex) 
        { 
            if (ex.Message == "Invalid or expired OTP." || ex.Message == "Email already exists.")
                return BadRequest(new { message = ex.Message });

            return BadRequest(new { message = "An error occurred during registration. Please try again." }); 
        }
    }



    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex) { return Unauthorized(new { message = ex.Message }); }
    }
}
