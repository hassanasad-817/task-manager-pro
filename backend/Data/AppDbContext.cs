using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Models;

namespace TaskManagerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<User> Users => Set<User>();

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

        modelBuilder.Entity<Project>().HasData(
            new Project { Id = 1, Name = "Website Redesign" },
            new Project { Id = 2, Name = "Mobile App" },
            new Project { Id = 3, Name = "Backend API" }
        );

        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem { Id = 1, Title = "Design landing page", Description = "Create Figma mockups", Status = TaskItemStatus.Todo, Priority = Priority.High, ProjectId = 1, CreatedAt = DateTime.UtcNow },
            new TaskItem { Id = 2, Title = "Set up CI/CD", Description = "Configure GitHub Actions", Status = TaskItemStatus.InProgress, Priority = Priority.Medium, ProjectId = 3, CreatedAt = DateTime.UtcNow },
            new TaskItem { Id = 3, Title = "User authentication", Description = "Implement login screen", Status = TaskItemStatus.Done, Priority = Priority.High, ProjectId = 2, CreatedAt = DateTime.UtcNow }
        );
    }
}
