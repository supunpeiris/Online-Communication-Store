using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OnlineStore.Application.DTOs.Profile;
using OnlineStore.Application.Interfaces;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IMemoryCache _cache;

    public ProfileController(AppDbContext context, IEmailService emailService, IMemoryCache cache)
    {
        _context = context;
        _emailService = emailService;
        _cache = cache;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetProfile(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Phone,
            user.Role
        });
    }

    [HttpGet("{userId}/orders")]
    public async Task<IActionResult> GetUserOrders(int userId)
    {
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var result = new List<object>();
        foreach (var order in orders)
        {
            var items = await _context.OrderItems
                .Where(oi => oi.OrderId == order.Id)
                .Join(_context.Products, oi => oi.ProductId, p => p.Id, (oi, p) => new
                {
                    p.Name,
                    p.ImageUrl,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.Subtotal
                })
                .ToListAsync();

            result.Add(new
            {
                order.Id,
                order.OrderNumber,
                order.Status,
                order.Total,
                order.CreatedAt,
                Items = items
            });
        }

        return Ok(result);
    }
      
          [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrderDetails(int orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return NotFound(new { message = "Order not found" });

        var address = await _context.Addresses.FindAsync(order.ShippingAddressId);
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
        var shipping = await _context.Shippings.FirstOrDefaultAsync(s => s.OrderId == order.Id);

        var items = await _context.OrderItems
            .Where(oi => oi.OrderId == order.Id)
            .Join(_context.Products, oi => oi.ProductId, p => p.Id, (oi, p) => new
            {
                p.Name,
                p.ImageUrl,
                oi.Quantity,
                oi.UnitPrice,
                oi.Subtotal
            })
            .ToListAsync();

        return Ok(new
        {
            order.Id,
            order.OrderNumber,
            order.Status,
            order.Subtotal,
            order.ShippingFee,
            order.Total,
            order.CreatedAt,
            PaymentMethod = payment?.PaymentMethod ?? "Card",
            PaymentStatus = payment?.Status ?? "Completed",
            Courier = shipping?.Courier ?? "Express Delivery",
            ShippingStatus = shipping?.Status ?? "Pending",
            Address = address != null ? $"{address.AddressLine}, {address.City}, {address.PostalCode}" : "N/A",
            Items = items
        });
    }

    [HttpPost("request-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null) return NotFound(new { message = "User with this email does not exist." });

        var otp = new Random().Next(100000, 999999).ToString();
        _cache.Set($"RESET_OTP_{dto.Email}", otp, TimeSpan.FromMinutes(10));

               try
        {
            await _emailService.SendPasswordResetOtpEmailAsync(dto.Email, otp);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to send email. Check SMTP settings: {ex.Message}" });
        }


        return Ok(new { message = "OTP sent to your email successfully." });
    }

    [HttpPost("verify-change-password")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyAndChangePassword([FromBody] VerifyAndChangePasswordDto dto)
    {
        if (!_cache.TryGetValue($"RESET_OTP_{dto.Email}", out string? savedOtp) || savedOtp != dto.Otp)
        {
            return BadRequest(new { message = "OTP has expired or is invalid." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null) return NotFound(new { message = "User not found." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        _cache.Remove($"RESET_OTP_{dto.Email}");

        return Ok(new { message = "Password changed successfully!" });
    }
}
