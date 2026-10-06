using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CouponsController(AppDbContext context)
    {
        _context = context;
    }

    private async Task LogActivity(string action, string details)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? "Staff";

        if (int.TryParse(userIdClaim, out int userId))
        {
            var user = await _context.Users.FindAsync(userId);
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                UserName = user?.Name ?? "Admin/Staff",
                UserEmail = emailClaim ?? user?.Email ?? "N/A",
                Role = roleClaim,
                Action = action,
                Module = "Coupons",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // GET: api/v1/coupons (Admin/Staff list all coupons)
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        return Ok(coupons);
    }

    // POST: api/v1/coupons/validate (Customer validates promo code at checkout)
    [HttpPost("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(new { message = "Coupon code is required." });

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == dto.Code.Trim().ToUpper());

        if (coupon == null)
            return NotFound(new { message = "Invalid coupon code." });

        var now = DateTime.UtcNow.Date;
        if (coupon.Status != "Active" || now < coupon.StartDate.Date || now > coupon.EndDate.Date)
            return BadRequest(new { message = "This coupon has expired or is inactive." });

        if (dto.CartSubtotal < coupon.MinimumOrderAmount)
            return BadRequest(new { message = $"Minimum order amount of Rs. {coupon.MinimumOrderAmount:F2} required to use this code." });

        // Check global usage limit if configured
        if (coupon.UsageLimit > 0)
        {
            var timesUsed = await _context.Orders.CountAsync(o => o.CouponId == coupon.Id && o.Status != "Cancelled");
            if (timesUsed >= coupon.UsageLimit)
                return BadRequest(new { message = "This coupon code has reached its maximum usage limit." });
        }

        // Calculate discount deduction
        decimal discountAmount = 0;
        if (coupon.DiscountType == "Percentage")
        {
            discountAmount = dto.CartSubtotal * (coupon.DiscountValue / 100m);
            if (coupon.MaximumDiscount > 0 && discountAmount > coupon.MaximumDiscount)
            {
                discountAmount = coupon.MaximumDiscount;
            }
        }
        else
        {
            discountAmount = coupon.DiscountValue;
        }

        discountAmount = Math.Min(discountAmount, dto.CartSubtotal);

        return Ok(new
        {
            couponId = coupon.Id,
            code = coupon.Code,
            discountType = coupon.DiscountType,
            discountValue = coupon.DiscountValue,
            discountAmount = Math.Round(discountAmount, 2),
            newTotal = Math.Round(dto.CartSubtotal - discountAmount, 2),
            message = $"Coupon '{coupon.Code}' applied successfully!"
        });
    }

    // POST: api/v1/coupons (Admin/Staff create coupon)
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateCouponDto dto)
    {
        var existing = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToUpper() == dto.Code.Trim().ToUpper());
        if (existing != null)
            return BadRequest(new { message = "A coupon with this code already exists." });

        if (dto.EndDate <= dto.StartDate)
            return BadRequest(new { message = "End date must be greater than start date." });

        var coupon = new Coupon
        {
            Code = dto.Code.Trim().ToUpper(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinimumOrderAmount = dto.MinimumOrderAmount,
            MaximumDiscount = dto.MaximumDiscount,
            UsageLimit = dto.UsageLimit,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = dto.Status
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        await LogActivity("Created", $"Created coupon '{coupon.Code}' ({coupon.DiscountValue}{(coupon.DiscountType == "Percentage" ? "%" : " Rs")})");
        return Ok(coupon);
    }

    // PUT: api/v1/coupons/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCouponDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound(new { message = "Coupon not found." });

        if (dto.EndDate <= dto.StartDate)
            return BadRequest(new { message = "End date must be greater than start date." });

        coupon.Code = dto.Code.Trim().ToUpper();
        coupon.DiscountType = dto.DiscountType;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MinimumOrderAmount = dto.MinimumOrderAmount;
        coupon.MaximumDiscount = dto.MaximumDiscount;
        coupon.UsageLimit = dto.UsageLimit;
        coupon.StartDate = dto.StartDate;
        coupon.EndDate = dto.EndDate;
        coupon.Status = dto.Status;

        await _context.SaveChangesAsync();
        await LogActivity("Updated", $"Updated coupon '{coupon.Code}'");
        return Ok(coupon);
    }

    // DELETE: api/v1/coupons/{id} (Admin Only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound(new { message = "Coupon not found." });

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();

        await LogActivity("Deleted", $"Deleted coupon code '{coupon.Code}'");
        return Ok(new { message = "Coupon deleted successfully." });
    }

        // GET: api/v1/coupons/active (Public: List all valid coupons for customers at checkout)
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveCoupons()
    {
        var now = DateTime.UtcNow.Date;
        var coupons = await _context.Coupons
            .Where(c => c.Status == "Active" && c.StartDate.Date <= now && c.EndDate.Date >= now)
            .OrderBy(c => c.MinimumOrderAmount)
            .Select(c => new
            {
                c.Id,
                c.Code,
                c.DiscountType,
                c.DiscountValue,
                c.MinimumOrderAmount,
                c.MaximumDiscount,
                c.EndDate
            })
            .ToListAsync();

        return Ok(coupons);
    }

}

public class CreateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percentage";
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public decimal MaximumDiscount { get; set; }
    public int UsageLimit { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active";
}

public class ValidateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public decimal CartSubtotal { get; set; }
}
