using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class Comment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Text { get; set; } = string.Empty;

    public int TaskId { get; set; }
    public TaskItem? Task { get; set; }

    [Required]
    [MaxLength(50)]
    public string Author { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
