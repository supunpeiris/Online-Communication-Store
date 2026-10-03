using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Staff")]
public class ActivityLogController : ControllerBase
{
    private readonly AppDbContext _context;

    public ActivityLogController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _context.ActivityLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(100) // Fetch latest 100 logs
            .ToListAsync();

        return Ok(logs);
    }
}
