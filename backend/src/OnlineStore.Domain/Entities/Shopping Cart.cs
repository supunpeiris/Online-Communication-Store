using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class Cart : BaseEntity
{
    public int UserId { get; set; }
}

public class CartItem : BaseEntity
{
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
