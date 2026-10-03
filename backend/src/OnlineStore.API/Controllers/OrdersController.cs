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

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Create Address (mapped to actual Address entity properties)
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

            // 2. Create Order
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

            // 3. Create Order Items & Update Stock
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

            // 4. Create Payment Record
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

            // 5. Create Shipping Record
            var shipping = new Shipping
            {
                OrderId = order.Id,
                AddressId = address.Id,
                Courier = "Express Delivery",
                ShippingFee = 0.00m,
                Status = "Pending"
            };
            _context.Shippings.Add(shipping);

            // 6. Clear User Cart Items (Fixed with explicit EF Core FirstOrDefaultAsync)
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
