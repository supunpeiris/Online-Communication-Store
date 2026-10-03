using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class ActivityLog : BaseEntity
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // e.g., Created, Updated, Deleted
    public string Module { get; set; } = string.Empty; // e.g., Products, Categories, Staff
    public string Details { get; set; } = string.Empty; // e.g., Created product: iPhone 15
}
