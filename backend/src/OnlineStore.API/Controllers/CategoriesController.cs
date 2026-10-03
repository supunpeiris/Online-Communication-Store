using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineStore.Application.DTOs.Category;
using OnlineStore.Application.Interfaces;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly AppDbContext _context;

    public CategoriesController(ICategoryService categoryService, AppDbContext context)
    {
        _categoryService = categoryService;
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
                Module = "Categories",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // Admin, Staff, and Customers can read
    [HttpGet]
    [AllowAnonymous]
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
        await LogActivity("Created", $"Created category: {dto.Name}");
        return CreatedAtAction(nameof(GetAll), new { id = category.Id }, category);
    }

    // Staff and Admins can update
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryDto dto)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, dto);
            await LogActivity("Updated", $"Updated category ID {id}: {dto.Name}");
            return Ok(category);
        }
        catch (Exception ex) { return NotFound(new { message = ex.Message }); }
    }

    // Only Admins can delete
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        var targetCategory = categories.FirstOrDefault(c => c.Id == id);

        var result = await _categoryService.DeleteCategoryAsync(id);
        if (!result) return NotFound(new { message = "Category not found" });

        await LogActivity("Deleted", $"Deleted category ID {id}: {targetCategory?.Name}");
        return Ok(new { message = "Category deleted successfully" });
    }
}
