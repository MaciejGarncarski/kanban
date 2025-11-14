[![codecov](https://codecov.io/gh/maciejgarncarski/kanban/branch/main/graph/badge.svg)](https://codecov.io/gh/maciejgarncarski/kanban)
[![CI](https://github.com/maciejgarncarski/kanban/actions/workflows/publish-docker.yml/badge.svg)](https://github.com/maciejgarncarski/kanban/actions)
[![CD](https://github.com/maciejgarncarski/kanban/actions/workflows/deploy.yml/badge.svg)](https://github.com/maciejgarncarski/kanban/actions)

# Kanban app

Kanban App is a simple and intuitive task management tool that helps teams and individuals organize work using the Kanban method.

<img src="https://raw.githubusercontent.com/MaciejGarncarski/kanban/refs/heads/main/.github/assets/presentation.gif">

## 🌍 Live demo

👉 [**kanban.maciej-garncarski.pl**](https://kanban.maciej-garncarski.pl)

API docs: [**Swagger UI**](https://kanban-api.maciej-garncarski.pl/api)

## 🧱 Tech Stack

| Frontend          | Backend                          | DevOps / Infra          |
| ----------------- | -------------------------------- | ----------------------- |
| ⚡ Next.js        | 🧠 NestJS (Hexagonal, CQRS, DDD) | 🐳 Docker               |
| 🎨 Mantine UI     | 🧩 Drizzle ORM                   | 🧾 GitHub Actions CI/CD |
| 🛠️ TanStack Query | 🔍 OpenAPI / Swagger             | 🐘 PostgreSQL           |

## ✨ Features

- 👥 **Teams CRUD**
- 🧭 **Boards CRUD**
- 🧾 **Task cards CRUD**
- 🔄 **Real-time updates (Server-Sent Events)**
- 🧱 **Hexagonal Architecture + CQRS + DDD**
- 🧪 **CI/CD & full test coverage**

---

## 🧰 Local Development

### 1️⃣ Configure Environment

Fill .env in /web and /api based on .env.example in each folder

### 2️⃣ Start Database

`docker compose -f ./docker/compose.dev.yml up --build`

#### Then initialize DB inside /api

`pnpm db:reset`

### 3️⃣ Run dev servers

Run separately in /web and /api

`pnpm dev`

## 🚀 Run Production Locally

Prepare .env.production from example and run:

`docker compose --env-file .env.production -f ./docker/compose.prod.yml up --build --pull never`

### To reset the production DB:

`docker exec -it kanban-api-prod sh`

`pnpm dlx tsx ./src/infrastructure/persistence/db/reset`

## 🧪 Testing

### Storybook

In /web

`pnpm storybook`

### Unit & Integration

In /api

run `pnpm test`

### E2E

In /api

[Prepare database](#prepare-database) then run

then run `pnpm test:e2e`

## 🧠 Architecture

```
.
├── api/         # NestJS backend (CQRS + DDD + Hexagonal)
├── web/         # Next.js frontend (Mantine UI)
├── docker/      # Dev & Prod Docker compose setups
├── .github/     # CI/CD workflows
└── README.md
```
