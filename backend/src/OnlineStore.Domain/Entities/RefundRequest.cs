using OnlineStore.Domain.Common;

namespace OnlineStore.Domain.Entities;

public class RefundRequest : BaseEntity
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string SlipUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // "Pending", "Accepted", "Rejected"
    public string? AdminNote { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
