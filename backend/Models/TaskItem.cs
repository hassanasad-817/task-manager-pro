using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public TaskItemStatus Status { get; set; }

    [Required]
    public Priority Priority { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
