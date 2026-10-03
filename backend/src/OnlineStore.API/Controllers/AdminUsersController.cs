using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Staff")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
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
                Module = "Staff",
                Details = details
            });
            await _context.SaveChangesAsync();
        }
    }

    // GET: api/v1/adminusers/customers (Only Customers)
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _context.Users
            .Where(u => u.Role == "Customer")
            .Select(u => new { u.Id, u.Name, u.Email, u.Phone, u.Status, u.CreatedAt })
            .ToListAsync();
        return Ok(customers);
    }

    // GET: api/v1/adminusers/staff (Only Admin & Staff)
    [HttpGet("staff")]
    public async Task<IActionResult> GetStaffAndAdmins()
    {
        var staffList = await _context.Users
            .Where(u => u.Role == "Admin" || u.Role == "Staff")
            .Select(u => new { u.Id, u.Name, u.Email, u.Phone, u.Role, u.Status, u.CreatedAt })
            .ToListAsync();
        return Ok(staffList);
    }

    // POST: api/v1/adminusers (Admin Only - Add staff/admin member)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already exists." });

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Role = dto.Role, // "Staff" or "Admin"
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Status = "Active"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await LogActivity("Created", $"Added new staff member: {dto.Name} ({dto.Email}) as {dto.Role}");

        return Ok(new { message = "Staff member created successfully!" });
    }

    // PUT: api/v1/adminusers/{id} (Admin Only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.Phone = dto.Phone;
        user.Role = dto.Role;
        user.Status = dto.Status;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
        
        await LogActivity("Updated", $"Updated staff member ID {id}: {dto.Name}");

        return Ok(new { message = "Staff member updated successfully!" });
    }

    // DELETE: api/v1/adminusers/{id} (Admin Only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        await LogActivity("Deleted", $"Deleted staff member ID {id}: {user.Name}");

        return Ok(new { message = "User deleted successfully!" });
    }
}

public class CreateStaffDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff";
    public string Password { get; set; } = string.Empty;
}

public class UpdateStaffDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Password { get; set; }
}
