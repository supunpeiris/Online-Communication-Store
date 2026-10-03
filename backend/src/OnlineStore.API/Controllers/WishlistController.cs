using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetWishlist(int userId)
    {
        var wishlist = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = userId };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        var items = await _context.WishlistItems
            .Where(wi => wi.WishlistId == wishlist.Id)
            .Join(_context.Products,
                wi => wi.ProductId,
                p => p.Id,
                (wi, p) => new {
                    id = wi.Id, // Primary key of WishlistItem
                    productId = p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    p.Brand
                })
            .ToListAsync();

        return Ok(new { wishlist.Id, userId, items });
    }

    [HttpPost("items")]
    public async Task<IActionResult> ToggleItem([FromBody] WishlistToggleDto dto)
    {
        var wishlist = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == dto.UserId);
        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = dto.UserId };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        var existingItem = await _context.WishlistItems
            .FirstOrDefaultAsync(wi => wi.WishlistId == wishlist.Id && wi.ProductId == dto.ProductId);

        if (existingItem != null)
        {
            _context.WishlistItems.Remove(existingItem);
            await _context.SaveChangesAsync();
            return Ok(new { status = "removed" });
        }
        else
        {
            // Verify product actually exists before adding
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists) return NotFound(new { message = "Product does not exist" });

            var newItem = new WishlistItem
            {
                WishlistId = wishlist.Id,
                ProductId = dto.ProductId
            };
            _context.WishlistItems.Add(newItem);
            await _context.SaveChangesAsync();
            return Ok(new { status = "added" });
        }
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var item = await _context.WishlistItems.FindAsync(id);
        if (item == null) return NotFound(new { message = "Wishlist item not found" });

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Wishlist item removed" });
    }
}

public class WishlistToggleDto
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
}
