using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.Models;
using TaskManagerApi.Models.DTOs;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.Name) ?? "unknown";

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? projectId,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? search)
    {
        var query = _context.Tasks
            .Include(t => t.Project)
            .AsQueryable();

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TaskItemStatus>(status, true, out var statusFilter))
            query = query.Where(t => t.Status == statusFilter);

        if (!string.IsNullOrWhiteSpace(priority) && Enum.TryParse<Priority>(priority, true, out var priorityFilter))
            query = query.Where(t => t.Priority == priorityFilter);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                ProjectId = t.ProjectId,
                ProjectName = t.Project!.Name,
                ProjectColor = t.Project.Color,
                UserId = t.UserId,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Comments)
            .Where(t => t.Id == id)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                ProjectId = t.ProjectId,
                ProjectName = t.Project!.Name,
                ProjectColor = t.Project.Color,
                UserId = t.UserId,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                Comments = t.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new CommentDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    Author = c.Author,
                    CreatedAt = c.CreatedAt
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (task == null)
            return NotFound(new { message = "Task not found" });

        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        if (!await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId))
            return BadRequest(new { message = "Project not found" });

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            Priority = dto.Priority,
            ProjectId = dto.ProjectId,
            UserId = UserId,
            CreatedAt = DateTime.UtcNow,
            DueDate = dto.DueDate
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await LogActivity("created", $"Created task \"{task.Title}\"", task.Id);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, await GetFullTask(task.Id));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        if (!await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId))
            return BadRequest(new { message = "Project not found" });

        var changes = new List<string>();
        if (task.Title != dto.Title) changes.Add("title");
        if (task.Status != dto.Status) changes.Add($"status to {dto.Status}");
        if (task.Priority != dto.Priority) changes.Add($"priority to {dto.Priority}");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.ProjectId = dto.ProjectId;
        task.DueDate = dto.DueDate;

        await _context.SaveChangesAsync();

        if (changes.Count > 0)
            await LogActivity("updated", $"Updated {string.Join(", ", changes)} on \"{task.Title}\"", task.Id);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        var title = task.Title;
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        await LogActivity("deleted", $"Deleted task \"{title}\"", null);

        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var now = DateTime.UtcNow;
        var tasks = await _context.Tasks.ToListAsync();

        var stats = new TaskStatsDto
        {
            Total = tasks.Count,
            Todo = tasks.Count(t => t.Status == TaskItemStatus.Todo),
            InProgress = tasks.Count(t => t.Status == TaskItemStatus.InProgress),
            Done = tasks.Count(t => t.Status == TaskItemStatus.Done),
            Overdue = tasks.Count(t => t.DueDate < now && t.Status != TaskItemStatus.Done),
            HighPriority = tasks.Count(t => t.Priority == Priority.High && t.Status != TaskItemStatus.Done)
        };

        return Ok(stats);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        var comment = new Comment
        {
            Text = dto.Text,
            TaskId = id,
            Author = UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        await LogActivity("commented", $"Commented on \"{task.Title}\"", id);

        return Ok(await GetFullTask(id));
    }

    private async Task<TaskResponseDto?> GetFullTask(int id)
    {
        return await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.Comments)
            .Where(t => t.Id == id)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                ProjectId = t.ProjectId,
                ProjectName = t.Project!.Name,
                ProjectColor = t.Project.Color,
                UserId = t.UserId,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                Comments = t.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new CommentDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    Author = c.Author,
                    CreatedAt = c.CreatedAt
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    private async Task LogActivity(string action, string description, int? taskId)
    {
        _context.ActivityLogs.Add(new ActivityLog
        {
            Action = action,
            Description = description,
            TaskId = taskId,
            Username = UserId,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}
