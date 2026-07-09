using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Models;

namespace TaskManagerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<TaskItem>()
            .Property(t => t.Priority)
            .HasConversion<string>();

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Task)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, Name = "Website Redesign", Description = "Company website overhaul", Color = "#3B82F6" },
            new Project { Id = 2, Name = "Mobile App", Description = "React Native mobile application", Color = "#8B5CF6" },
            new Project { Id = 3, Name = "Backend API", Description = "Core API infrastructure", Color = "#10B981" }
        );

        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem { Id = 1, Title = "Design landing page", Description = "Create Figma mockups for the new landing page", Status = TaskItemStatus.Todo, Priority = Priority.High, ProjectId = 1, CreatedAt = DateTime.UtcNow, UserId = "" },
            new TaskItem { Id = 2, Title = "Set up CI/CD", Description = "Configure GitHub Actions pipeline", Status = TaskItemStatus.InProgress, Priority = Priority.Medium, ProjectId = 3, CreatedAt = DateTime.UtcNow, UserId = "" },
            new TaskItem { Id = 3, Title = "User authentication", Description = "Implement login and registration screens", Status = TaskItemStatus.Done, Priority = Priority.High, ProjectId = 2, CreatedAt = DateTime.UtcNow, UserId = "" }
        );
    }
}
