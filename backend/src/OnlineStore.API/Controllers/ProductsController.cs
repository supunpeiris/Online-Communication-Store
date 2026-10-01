using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineStore.Application.DTOs.Product;
using OnlineStore.Application.Interfaces;

namespace OnlineStore.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // Admins, Staff, and Customers can all read
    [HttpGet]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    // Only Admins can add
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = product.Id }, product);
    }
    
    // Admins and Staff can update
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public IActionResult Update(int id, [FromBody] CreateProductDto dto)
    {
        // Add Update logic to ProductService later
        return Ok(new { message = "Update authorized" });
    }

    // Only Admins can delete
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        // Add Delete logic to ProductService later
        return Ok(new { message = "Delete authorized" });
    }
}
