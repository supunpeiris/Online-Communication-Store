using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // e.g., Admin, Customer
    public string Status { get; set; } = "Active"; // e.g., Active, Inactive
}
