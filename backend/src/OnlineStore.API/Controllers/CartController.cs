using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetCart(int userId)
    {
        var cart = await _context.Carts
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var items = await _context.CartItems
            .Where(ci => ci.CartId == cart.Id)
            .Join(_context.Products,
                ci => ci.ProductId,
                p => p.Id,
                (ci, p) => new {
                    ci.Id,
                    ci.CartId,
                    ci.ProductId,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    ci.Quantity,
                    ci.Subtotal
                })
            .ToListAsync();

        return Ok(new { cart.Id, userId, items });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddOrUpdateItem([FromBody] CartItemDto dto)
    {
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == dto.UserId);
        if (cart == null)
        {
            cart = new Cart { UserId = dto.UserId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound(new { message = "Product not found" });

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == dto.ProductId);

        if (cartItem == null)
        {
            cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.Price,
                Subtotal = product.Price * dto.Quantity
            };
            _context.CartItems.Add(cartItem);
        }
        else
        {
            cartItem.Quantity = dto.Quantity;
            cartItem.Subtotal = cartItem.UnitPrice * cartItem.Quantity;
        }

        await _context.SaveChangesAsync();
        return Ok(cartItem);
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        var item = await _context.CartItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Item removed" });
    }
}

public class CartItemDto
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
