using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class Order : BaseEntity
{
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public int BillingAddressId { get; set; }
    public int? CouponId { get; set; }
    
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }
}

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
}

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string TransactionReference { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
}

public class Shipping : BaseEntity
{
    public int OrderId { get; set; }
    public int AddressId { get; set; }
    public string? Courier { get; set; }
    public string? TrackingNumber { get; set; }
    public decimal ShippingFee { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}
