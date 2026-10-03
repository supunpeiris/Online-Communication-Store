using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Staff")]
public class DiscountsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiscountsController(AppDbContext context)
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
                Module = "Discounts",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var discounts = await _context.Discounts
            .Include(d => d.Products)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return Ok(discounts);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiscountDto dto)
    {
        // Date Validations
        var today = DateTime.UtcNow.Date;
        var startDate = dto.StartDate.Date;
        var endDate = dto.EndDate.Date;

        if (startDate < today.AddDays(-1))
        {
            return BadRequest(new { message = "Start date must be today or a future date." });
        }

        if (endDate <= startDate)
        {
            return BadRequest(new { message = "End date must be greater than the start date." });
        }

        var existingDiscount = await _context.Discounts
            .FirstOrDefaultAsync(d => d.Title == dto.Title && d.DiscountValue == dto.DiscountValue && d.StartDate == dto.StartDate);

        if (existingDiscount != null)
        {
            return BadRequest(new { message = "An identical discount already exists." });
        }

        var discount = new Discount
        {
            Title = dto.Title,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = dto.Status
        };

        _context.Discounts.Add(discount);
        await _context.SaveChangesAsync();

        if (dto.ProductIds != null && dto.ProductIds.Count > 0)
        {
            var distinctProductIds = dto.ProductIds.Distinct().ToList();
            var products = await _context.Products.Where(p => distinctProductIds.Contains(p.Id)).ToListAsync();
            foreach (var p in products)
            {
                p.DiscountId = discount.Id;
            }
            await _context.SaveChangesAsync();
        }

        var productNames = await _context.Products
            .Where(p => p.DiscountId == discount.Id)
            .Select(p => p.Name)
            .ToListAsync();

        string targetProducts = productNames.Count > 0 ? string.Join(", ", productNames) : "No products attached";
        await LogActivity("Created", $"Created discount '{discount.Title}' ({discount.DiscountValue}{(discount.DiscountType == "Percentage" ? "%" : " Rs")}) applied to products: [{targetProducts}]");

        return Ok(discount);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateDiscountDto dto)
    {
        // Date Validations
        var startDate = dto.StartDate.Date;
        var endDate = dto.EndDate.Date;

        if (endDate <= startDate)
        {
            return BadRequest(new { message = "End date must be greater than the start date." });
        }

        var discount = await _context.Discounts.Include(d => d.Products).FirstOrDefaultAsync(d => d.Id == id);
        if (discount == null) return NotFound(new { message = "Discount not found." });

        discount.Title = dto.Title;
        discount.DiscountType = dto.DiscountType;
        discount.DiscountValue = dto.DiscountValue;
        discount.StartDate = dto.StartDate;
        discount.EndDate = dto.EndDate;
        discount.Status = dto.Status;

        var currentProducts = await _context.Products.Where(p => p.DiscountId == id).ToListAsync();
        foreach (var p in currentProducts)
        {
            p.DiscountId = null;
        }

        if (dto.ProductIds != null && dto.ProductIds.Count > 0)
        {
            var distinctProductIds = dto.ProductIds.Distinct().ToList();
            var newProducts = await _context.Products.Where(p => distinctProductIds.Contains(p.Id)).ToListAsync();
            foreach (var p in newProducts)
            {
                p.DiscountId = discount.Id;
            }
        }

        await _context.SaveChangesAsync();

        var updatedProductNames = await _context.Products
            .Where(p => p.DiscountId == discount.Id)
            .Select(p => p.Name)
            .ToListAsync();

        string targetProducts = updatedProductNames.Count > 0 ? string.Join(", ", updatedProductNames) : "No products attached";
        await LogActivity("Updated", $"Updated discount '{discount.Title}'. Applied to products: [{targetProducts}]");

        return Ok(discount);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var discount = await _context.Discounts
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == id);
            
        if (discount == null) return NotFound(new { message = "Discount not found." });

        var linkedProducts = await _context.Products.Where(p => p.DiscountId == id).ToListAsync();
        foreach (var p in linkedProducts)
        {
            p.DiscountId = null;
        }

        _context.Discounts.Remove(discount);
        await _context.SaveChangesAsync();

        await LogActivity("Deleted", $"Deleted discount: '{discount.Title}'");

        return Ok(new { message = "Discount deleted successfully!" });
    }
}

public class CreateDiscountDto
{
    public string Title { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percentage";
    public decimal DiscountValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active";
    public List<int> ProductIds { get; set; } = new();
}
