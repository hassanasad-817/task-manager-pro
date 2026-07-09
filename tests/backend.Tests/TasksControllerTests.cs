using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Controllers;
using TaskManagerApi.Data;
using TaskManagerApi.Models;
using TaskManagerApi.Models.DTOs;

namespace TaskManagerApi.Tests;

public class TasksControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        db.Projects.Add(new Project { Id = 1, Name = "Test Project" });
        db.SaveChanges();
        return db;
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoTasks()
    {
        var db = CreateDbContext();
        var controller = new TasksController(db);

        var result = await controller.GetAll(null, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<List<TaskResponseDto>>(okResult.Value);
        Assert.Empty(tasks);
    }

    [Fact]
    public async Task Create_AddsTask_AndReturns201()
    {
        var db = CreateDbContext();
        var controller = new TasksController(db);

        var dto = new CreateTaskDto
        {
            Title = "New Task",
            Description = "Test description",
            Status = TaskItemStatus.Todo,
            Priority = Priority.High,
            ProjectId = 1
        };

        var result = await controller.Create(dto);

        var actionResult = Assert.IsType<CreatedAtActionResult>(result);
        var task = Assert.IsType<TaskResponseDto>(actionResult.Value);
        Assert.Equal("New Task", task.Title);
        Assert.Equal("High", task.Priority);
    }
}
