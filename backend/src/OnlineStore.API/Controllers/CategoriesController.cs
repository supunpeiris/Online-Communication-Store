using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineStore.Application.DTOs.Category;
using OnlineStore.Application.Interfaces;

namespace OnlineStore.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // Admin, Staff, and Customers can read
    [HttpGet]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    // Only Admins can add/create
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var category = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = category.Id }, category);
    }

    // Staff (and Admins) can update
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public IActionResult Update(int id, [FromBody] CreateCategoryDto dto)
    {
        // Update logic will go here
        return Ok(new { message = $"Category {id} update authorized." });
    }

    // Only Admins can delete
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        // Delete logic will go here
        return Ok(new { message = $"Category {id} delete authorized." });
    }
}
