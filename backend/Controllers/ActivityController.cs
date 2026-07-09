using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.Models.DTOs;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _context;

    public ActivityController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 20)
    {
        var activities = await _context.ActivityLogs
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new ActivityLogDto
            {
                Id = a.Id,
                Action = a.Action,
                Description = a.Description,
                TaskId = a.TaskId,
                Username = a.Username,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(activities);
    }
}
