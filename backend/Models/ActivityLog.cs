using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class ActivityLog
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // created, updated, deleted, status_changed, commented

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? TaskId { get; set; }

    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
