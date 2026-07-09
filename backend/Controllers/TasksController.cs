using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.Models;
using TaskManagerApi.Models.DTOs;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? projectId,
        [FromQuery] string? status,
        [FromQuery] string? priority)
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
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate
            })
            .FirstOrDefaultAsync();

        if (task == null)
            return NotFound(new { message = "Task not found" });

        return Ok(task);
    }

    [HttpPost]
    [Authorize]
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
            CreatedAt = DateTime.UtcNow,
            DueDate = dto.DueDate
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, MapToDto(task));
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        if (!await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId))
            return BadRequest(new { message = "Project not found" });

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.ProjectId = dto.ProjectId;
        task.DueDate = dto.DueDate;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static TaskResponseDto MapToDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status.ToString(),
            Priority = task.Priority.ToString(),
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name ?? "",
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate
        };
    }
}
