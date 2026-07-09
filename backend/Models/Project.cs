using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models;

public class Project
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(7)]
    public string Color { get; set; } = "#3B82F6";

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
