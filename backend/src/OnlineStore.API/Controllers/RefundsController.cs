using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class RefundsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RefundsController(AppDbContext context)
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
                UserName = user?.Name ?? "Staff",
                UserEmail = emailClaim ?? user?.Email ?? "N/A",
                Role = roleClaim,
                Action = action,
                Module = "Refunds",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // GET: api/v1/refunds (Admin/Staff view all refund requests)
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllRefunds()
    {
        var refunds = await (from r in _context.RefundRequests
                             join o in _context.Orders on r.OrderId equals o.Id
                             join u in _context.Users on r.UserId equals u.Id
                             orderby r.CreatedAt descending
                             select new
                             {
                                 r.Id,
                                 r.OrderId,
                                 r.UserId,
                                 OrderNumber = o.OrderNumber,
                                 CustomerName = u.Name,
                                 CustomerEmail = u.Email,
                                 CustomerPhone = u.Phone,
                                 r.Amount,
                                 r.Reason,
                                 r.SlipUrl,
                                 r.Status,
                                 r.AdminNote,
                                 r.CreatedAt,
                                 r.ProcessedAt
                             }).ToListAsync();

        return Ok(refunds);
    }

    // GET: api/v1/refunds/order/{orderId} (Customer/Admin view refund status for an order)
    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetRefundByOrderId(int orderId)
    {
        var refund = await _context.RefundRequests
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(r => r.OrderId == orderId);

        return Ok(refund);
    }

    // POST: api/v1/refunds (Customer submit refund request)
    [HttpPost]
    public async Task<IActionResult> CreateRefund([FromBody] CreateRefundDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized(new { message = "Invalid session." });

        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == dto.OrderId);
        if (order == null) return NotFound(new { message = "Order not found." });

        if (order.UserId != userId)
            return Forbid();

        // Rule 1: Must be Cancelled
        if (order.Status != "Cancelled")
            return BadRequest(new { message = "Only cancelled orders are eligible for refunds." });

        // Rule 2: Must be requested within 7 days of the order date
        var daysSinceOrder = (DateTime.UtcNow - order.CreatedAt).TotalDays;
        if (daysSinceOrder > 7)
        {
            return BadRequest(new { message = "Refund requests must be submitted within 7 days from the order placement date." });
        }

        // Rule 3: Must be an online / card payment (Not Cash on Delivery)
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
        string paymentMethod = payment?.PaymentMethod ?? "";
        if (paymentMethod.Contains("Cash", StringComparison.OrdinalIgnoreCase) || 
            paymentMethod.Contains("COD", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Cash on Delivery orders are not eligible for online refund requests." });
        }

        // Rule 4: Check if already requested
        var existing = await _context.RefundRequests.FirstOrDefaultAsync(r => r.OrderId == dto.OrderId);
        if (existing != null)
            return BadRequest(new { message = "A refund request has already been submitted for this order." });

        if (string.IsNullOrWhiteSpace(dto.SlipUrl))
            return BadRequest(new { message = "A payment slip / receipt is required." });

        var refund = new RefundRequest
        {
            OrderId = order.Id,
            UserId = userId,
            Amount = order.Total,
            Reason = dto.Reason,
            SlipUrl = dto.SlipUrl,
            Status = "Pending"
        };

        _context.RefundRequests.Add(refund);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Refund request submitted successfully!", refund });
    }

    // PUT: api/v1/refunds/{id}/status (Admin/Staff accept or reject)
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateRefundStatus(int id, [FromBody] UpdateRefundStatusDto dto)
    {
        var refund = await _context.RefundRequests.FindAsync(id);
        if (refund == null) return NotFound(new { message = "Refund request not found." });

        var order = await _context.Orders.FindAsync(refund.OrderId);

        refund.Status = dto.Status;
        refund.AdminNote = dto.AdminNote;
        refund.ProcessedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await LogActivity(
            dto.Status == "Accepted" ? "Accepted" : "Rejected",
            $"{dto.Status} refund request for Order #{order?.OrderNumber ?? refund.OrderId.ToString()} (Amount: Rs. {refund.Amount:F2})"
        );

        return Ok(new { message = $"Refund request {dto.Status.ToLower()} successfully!", refund });
    }
}

public class CreateRefundDto
{
    public int OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string SlipUrl { get; set; } = string.Empty;
}

public class UpdateRefundStatusDto
{
    public string Status { get; set; } = "Accepted";
    public string? AdminNote { get; set; }
}
