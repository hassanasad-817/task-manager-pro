using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TaskManagerApi.Controllers;
using TaskManagerApi.Data;
using TaskManagerApi.Models.DTOs;
using TaskManagerApi.Services;

namespace TaskManagerApi.Tests;

public class AuthControllerTests
{
    private static (AuthController, AppDbContext) CreateController()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestSuperSecretKeyForUnitTests2024!",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience"
            })
            .Build();

        var tokenService = new TokenService(config);
        var controller = new AuthController(db, tokenService);
        return (controller, db);
    }

    [Fact]
    public async Task Register_CreatesUser_AndReturnsToken()
    {
        var (controller, _) = CreateController();

        var request = new RegisterRequest
        {
            Username = "testuser",
            Password = "password123"
        };

        var result = await controller.Register(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value?.GetType().GetProperty("token")?.GetValue(okResult.Value);
        Assert.NotNull(response);
        Assert.NotEmpty(response?.ToString() ?? "");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var (controller, db) = CreateController();

        await controller.Register(new RegisterRequest
        {
            Username = "testuser",
            Password = "password123"
        });

        var result = await controller.Login(new LoginRequest
        {
            Username = "testuser",
            Password = "password123"
        });

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value?.GetType().GetProperty("token")?.GetValue(okResult.Value);
        Assert.NotNull(response);
        Assert.NotEmpty(response?.ToString() ?? "");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var (controller, _) = CreateController();

        var result = await controller.Login(new LoginRequest
        {
            Username = "wrong",
            Password = "wrong"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
