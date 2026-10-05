using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    private async Task LogActivity(string action, string details)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? "Admin";

        if (int.TryParse(userIdClaim, out int userId))
        {
            var user = await _context.Users.FindAsync(userId);
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                UserName = user?.Name ?? "Admin",
                UserEmail = emailClaim ?? user?.Email ?? "N/A",
                Role = roleClaim,
                Action = action,
                Module = "Reviews",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // GET: api/v1/reviews/product/{productId} (Public: Customer and Staff can read)
    [HttpGet("product/{productId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var reviews = await (from r in _context.Reviews
                             where r.ProductId == productId
                             join u in _context.Users on r.UserId equals u.Id into userGroup
                             from user in userGroup.DefaultIfEmpty()
                             orderby r.CreatedAt descending
                             select new
                             {
                                 r.Id,
                                 r.UserId,
                                 UserName = user != null ? user.Name : "Verified Customer",
                                 r.ProductId,
                                 r.Rating,
                                 r.Comment,
                                 r.VerifiedPurchase,
                                 r.CreatedAt
                             }).ToListAsync();

        return Ok(reviews);
    }

    // POST: api/v1/reviews (Customer / Staff / Admin create reviews)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Invalid user session." });
        }

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5." });
        }

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound(new { message = "Product not found." });

        // Verify if customer has actually bought and received the product
        bool hasPurchased = await (from o in _context.Orders
                                   where o.UserId == userId && (o.Status == "Completed" || o.Status == "Out for Delivery")
                                   join oi in _context.OrderItems on o.Id equals oi.OrderId
                                   where oi.ProductId == dto.ProductId
                                   select oi).AnyAsync();

        var review = new Review
        {
            UserId = userId,
            ProductId = dto.ProductId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            VerifiedPurchase = hasPurchased
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review submitted successfully!", review });
    }

    // DELETE: api/v1/reviews/{id} (Admin ONLY)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound(new { message = "Review not found." });

        var product = await _context.Products.FindAsync(review.ProductId);

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        await LogActivity("Deleted", $"Deleted review ID {id} for '{product?.Name ?? "Product #" + review.ProductId}' (Rating: {review.Rating}★)");

        return Ok(new { message = "Review deleted successfully." });
    }
}

public class CreateReviewDto
{
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
