using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class Address : BaseEntity
{
    public int UserId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class Review : BaseEntity
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool VerifiedPurchase { get; set; }
}

public class Wishlist : BaseEntity
{
    public int UserId { get; set; }
}

public class WishlistItem : BaseEntity
{
    public int WishlistId { get; set; }
    public int ProductId { get; set; }
}
