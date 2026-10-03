using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Application.DTOs.Product;
using OnlineStore.Application.Interfaces;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly AppDbContext _context;

    public ProductsController(IProductService productService, AppDbContext context)
    {
        _productService = productService;
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
                Module = "Products",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() => Ok(await _productService.GetAllProductsAsync());

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        try 
        { 
            var product = await _productService.GetProductByIdAsync(id);
            return Ok(product); 
        }
        catch (Exception ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        try 
        { 
            var product = await _productService.CreateProductAsync(dto);
            await LogActivity("Created", $"Created product: {dto.Name} (SKU: {product.Sku})");
            return Ok(product); 
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto dto)
    {
        try 
        { 
            var product = await _productService.UpdateProductAsync(id, dto);
            await LogActivity("Updated", $"Updated product ID {id}: {dto.Name}");
            return Ok(product); 
        }
        catch (Exception ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        var result = await _productService.DeleteProductAsync(id);
        if (!result) return NotFound(new { message = "Product not found" });

        await LogActivity("Deleted", $"Deleted product ID {id}: {product?.Name}");
        return Ok(new { message = "Product deleted successfully" });
    }
}
