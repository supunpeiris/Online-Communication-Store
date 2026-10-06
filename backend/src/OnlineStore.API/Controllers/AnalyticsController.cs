using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Staff")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        var totalOrders = await _context.Orders.CountAsync();
        var completedOrders = await _context.Orders.CountAsync(o => o.Status == "Completed");
        var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == "Cancelled");

        // Real lifetime revenue from non-cancelled orders
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != "Cancelled")
            .SumAsync(o => o.Total);

        var totalCustomers = await _context.Users
            .CountAsync(u => u.Role == "Customer" || u.Role == "customer");

        var lowStockCount = await _context.Products
            .CountAsync(p => p.StockQuantity <= 5);

        // Daily aggregate sales for the last 7 days
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
        var recentOrders = await _context.Orders
            .Where(o => o.CreatedAt >= sevenDaysAgo && o.Status != "Cancelled")
            .ToListAsync();

        var salesTimeline = new List<object>();
        for (int i = 0; i < 7; i++)
        {
            var dayDate = sevenDaysAgo.AddDays(i);
            var dayOrders = recentOrders.Where(o => o.CreatedAt.Date == dayDate.Date).ToList();

            salesTimeline.Add(new
            {
                date = dayDate.ToString("dd MMM"),
                sales = Math.Round(dayOrders.Sum(o => o.Total), 2),
                orders = dayOrders.Count
            });
        }

        var conversionRate = totalOrders > 0
            ? Math.Round(((double)completedOrders / totalOrders) * 100, 1)
            : 0;

        return Ok(new
        {
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue = Math.Round(totalRevenue, 2),
            totalCustomers,
            lowStockCount,
            conversionRate,
            salesTimeline
        });
    }
}
