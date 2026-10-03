using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Application.DTOs.Order;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
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
                Module = "Orders",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // GET: api/v1/orders/admin (Fetch all orders for Admin/Staff)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllAdminOrders()
    {
        var orders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var result = new List<object>();
        foreach (var order in orders)
        {
            var user = await _context.Users.FindAsync(order.UserId);
            var items = await _context.OrderItems
                .Where(oi => oi.OrderId == order.Id)
                .Join(_context.Products, oi => oi.ProductId, p => p.Id, (oi, p) => new
                {
                    p.Name,
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
                CustomerName = user?.Name ?? "Guest",
                CustomerEmail = user?.Email ?? "N/A",
                Items = items
            });
        }

        return Ok(result);
    }

    // PUT: api/v1/orders/{id}/status (Admin/Staff update order status)
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Order not found." });

        string oldStatus = order.Status;
        order.Status = dto.Status;
        await _context.SaveChangesAsync();

        await LogActivity("Updated", $"Changed order {order.OrderNumber} status from '{oldStatus}' to '{dto.Status}'");

        return Ok(new { message = "Order status updated successfully!" });
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var address = new Address
            {
                UserId = dto.UserId,
                AddressLine = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                IsDefault = true
            };
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            var order = new Order
            {
                UserId = dto.UserId,
                ShippingAddressId = address.Id,
                BillingAddressId = address.Id,
                OrderNumber = $"ORD-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                Status = "Processing",
                Subtotal = dto.Items.Sum(i => i.UnitPrice * i.Quantity),
                ShippingFee = 0.00m,
                Total = dto.Items.Sum(i => i.UnitPrice * i.Quantity)
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.StockQuantity -= item.Quantity;
                }

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.UnitPrice * item.Quantity
                };
                _context.OrderItems.Add(orderItem);
            }

            var payment = new Payment
            {
                OrderId = order.Id,
                PaymentMethod = dto.PaymentMethod,
                Amount = order.Total,
                Status = "Completed",
                TransactionReference = Guid.NewGuid().ToString(),
                PaidAt = DateTime.UtcNow
            };
            _context.Payments.Add(payment);

            var shipping = new Shipping
            {
                OrderId = order.Id,
                AddressId = address.Id,
                Courier = "Express Delivery",
                ShippingFee = 0.00m,
                Status = "Pending"
            };
            _context.Shippings.Add(shipping);

            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == dto.UserId);
            if (cart != null)
            {
                var cartItems = await _context.CartItems.Where(ci => ci.CartId == cart.Id).ToListAsync();
                _context.CartItems.RemoveRange(cartItems);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { order.Id, order.OrderNumber, message = "Order placed successfully!" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Failed to place order", error = ex.Message });
        }
    }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}
