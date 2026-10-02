using Microsoft.EntityFrameworkCore;
using OnlineStore.Application.DTOs.Product;
using OnlineStore.Application.Interfaces;
using OnlineStore.Domain.Entities;
using OnlineStore.Infrastructure.Data;

namespace OnlineStore.Application.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .ToListAsync();

        return products.Select(MapToDto);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            throw new Exception("Category does not exist.");

        var product = new Product
        {
            Name = dto.Name,
            // Auto-generate a random SKU if the frontend leaves it blank
            Sku = string.IsNullOrWhiteSpace(dto.Sku) ? $"SKU-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}" : dto.Sku,
            Brand = dto.Brand,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            ImageUrl = dto.ImageUrl,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Available" : dto.Status,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateProductAsync(int id, CreateProductDto dto)
    {
        var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) throw new Exception("Product not found");

        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            throw new Exception("Category does not exist.");

        product.Name = dto.Name;
        product.Sku = dto.Sku;
        product.Brand = dto.Brand;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.ImageUrl = dto.ImageUrl;
        product.Status = dto.Status;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();
        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        return MapToDto(product);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    // Centralized mapping method to keep code clean
    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Sku = product.Sku,
            Brand = product.Brand,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            ImageUrl = product.ImageUrl,
            Status = product.Status,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? "Unknown"
        };
    }
}
