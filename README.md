# Task Manager Pro

Full-stack task management application built with .NET Core 8 Web API and React + TypeScript.

## Features

- Create, view, update, and delete tasks
- Filter by project, status, and priority
- Due date tracking with overdue highlighting
- JWT authentication (login/register)
- Swagger API documentation
- Responsive design with Tailwind CSS

## Tech Stack

- **Backend:** .NET Core 8 Web API, Entity Framework Core, SQLite, JWT Authentication, Swagger
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, Axios, React Router v7
- **Testing:** xUnit (backend), Vitest + React Testing Library (frontend)
- **Deployment:** Vercel (frontend)

## Project Structure

```
task-manager-pro/
├── backend/              # .NET Core Web API
│   ├── Controllers/      # API endpoints
│   ├── Data/             # DbContext & migrations
│   ├── Models/           # Entities & DTOs
│   └── Services/         # Business logic (JWT token service)
├── frontend/             # React + TypeScript SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context provider
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client (Axios)
│   │   └── types/        # TypeScript interfaces
├── tests/
│   ├── backend.Tests/    # xUnit tests
│   └── frontend.Tests/   # (placeholder)
└── README.md
```

## Running Locally

### Prerequisites

- .NET 8 SDK
- Node.js 18+

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

The API will start at `http://localhost:5000` with Swagger at `http://localhost:5000/swagger`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the API URL (defaults to `http://localhost:5000/api`):

```bash
# Windows (PowerShell)
$env:VITE_API_URL="http://localhost:5000/api"

# or create .env file:
echo VITE_API_URL=http://localhost:5000/api > .env
```

### Running Tests

```bash
# Backend tests
cd tests/backend.Tests
dotnet test

# Frontend tests
cd frontend
npm test
```

## Deployment

- **Frontend:** https://frontend-woad-nine-8hfulwoq6n.vercel.app
- **Backend:** Pending deployment
