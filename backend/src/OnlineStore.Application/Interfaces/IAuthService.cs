using OnlineStore.Application.DTOs.Auth;

namespace OnlineStore.Application.Interfaces;

public interface IAuthService
{
    Task RequestOtpAsync(RequestOtpDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}

