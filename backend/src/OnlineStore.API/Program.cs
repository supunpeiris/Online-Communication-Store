using Microsoft.EntityFrameworkCore;
using OnlineStore.Infrastructure.Data;
using OnlineStore.Application.Interfaces;
using OnlineStore.Application.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Register Services
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();


// Register Entity Framework Core with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
