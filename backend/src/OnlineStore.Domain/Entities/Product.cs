using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class Product : BaseEntity
{
    public int CategoryId { get; set; }
    public int? DiscountId { get; set; }
    public Discount? Discount { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? SizeOrCapacity { get; set; }
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = "Available"; 
    public Category? Category { get; set; } 
     

}
