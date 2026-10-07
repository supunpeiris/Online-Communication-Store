using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }

    // GET: api/v1/addresses (List logged-in user's addresses, default first)
    [HttpGet]
    public async Task<IActionResult> GetUserAddresses()
    {
        int userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Invalid user session." });

        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(addresses);
    }

    // POST: api/v1/addresses (Create new address)
    [HttpPost]
    public async Task<IActionResult> CreateAddress([FromBody] AddressDto dto)
    {
        int userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized(new { message = "Invalid user session." });

        var totalAddresses = await _context.Addresses.CountAsync(a => a.UserId == userId);
        bool shouldBeDefault = dto.IsDefault || totalAddresses == 0;

        if (shouldBeDefault)
        {
            await _context.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));
        }

        var address = new Address
        {
            UserId = userId,
            RecipientName = dto.RecipientName.Trim(),
            Phone = dto.Phone.Trim(),
            AddressLine = dto.AddressLine.Trim(),
            City = dto.City.Trim(),
            District = dto.District?.Trim() ?? string.Empty,
            Province = dto.Province?.Trim() ?? string.Empty,
            PostalCode = dto.PostalCode.Trim(),
            IsDefault = shouldBeDefault
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(address);
    }

    // PUT: api/v1/addresses/{id} (Update address)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddressDto dto)
    {
        int userId = GetCurrentUserId();
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound(new { message = "Address not found." });

        if (dto.IsDefault && !address.IsDefault)
        {
            await _context.Addresses
                .Where(a => a.UserId == userId && a.Id != id && a.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));
            address.IsDefault = true;
        }

        address.RecipientName = dto.RecipientName.Trim();
        address.Phone = dto.Phone.Trim();
        address.AddressLine = dto.AddressLine.Trim();
        address.City = dto.City.Trim();
        address.District = dto.District?.Trim() ?? string.Empty;
        address.Province = dto.Province?.Trim() ?? string.Empty;
        address.PostalCode = dto.PostalCode.Trim();

        await _context.SaveChangesAsync();
        return Ok(address);
    }

    // PUT: api/v1/addresses/{id}/set-default
    [HttpPut("{id}/set-default")]
    public async Task<IActionResult> SetDefaultAddress(int id)
    {
        int userId = GetCurrentUserId();
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound(new { message = "Address not found." });

        await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));

        address.IsDefault = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Address set as default successfully.", address });
    }

    // DELETE: api/v1/addresses/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        int userId = GetCurrentUserId();
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound(new { message = "Address not found." });

        bool wasDefault = address.IsDefault;
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        if (wasDefault)
        {
            var fallback = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (fallback != null)
            {
                fallback.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { message = "Address deleted successfully." });
    }
}

public class AddressDto
{
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
