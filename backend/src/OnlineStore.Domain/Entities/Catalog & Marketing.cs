using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class Category : BaseEntity
{
    public int? ParentCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Discount : BaseEntity
{
    public string Title { get; set; } = string.Empty; // e.g. "Summer Sale 20%"
    public string DiscountType { get; set; } = "Percentage"; // Percentage or Fixed
    public decimal DiscountValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active";
    
    public ICollection<Product> Products { get; set; } = new List<Product>();
}


public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public decimal MaximumDiscount { get; set; }
    public int UsageLimit { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Active";
}
