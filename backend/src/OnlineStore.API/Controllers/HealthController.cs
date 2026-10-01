using Microsoft.AspNetCore.Mvc;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult CheckConnection()
    {
        var canConnect = _context.Database.CanConnect();
        return Ok(new { DatabaseConnected = canConnect, Message = "API is running" });
    }
}
