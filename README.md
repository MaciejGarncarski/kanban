[![codecov](https://codecov.io/gh/maciejgarncarski/kanban/branch/main/graph/badge.svg)](https://codecov.io/gh/maciejgarncarski/kanban)

# Kanban app

Kanban App is a simple and intuitive task management tool that helps teams and individuals organize work using the Kanban method.

<img src="https://raw.githubusercontent.com/MaciejGarncarski/kanban/refs/heads/main/.github/assets/presentation.gif">

## Live demo

[https://kanban.maciej-garncarski.pl](https://kanban.maciej-garncarski.pl)

## Swagger

[https://kanban-api.maciej-garncarski.pl/api](https://kanban-api.maciej-garncarski.pl/api)

## Tech Used

- next.js
- NestJS with Hexagonal, CQRS, DDD
- Mantine UI
- Docker
- Postgres
- OpenAPI, Swagger
- Drizzle ORM
- Github Actions CI/CD

## Features

- Teams CRUD
- Boards CRUD
- Task cards CRUD
- Server-Sent Events (SSE)

## Local development

### ENV

Fill .env in /web and /api based on .env.example in each folder

### Prepare database

`docker compose -f ./docker/compose.dev.yml up --build`

then in /api run

`pnpm db:reset`

### Start dev servers

Run separately in /web and /api

`pnpm dev`

## Run production locally

Set .env.production based on .env.production.example

then run

`docker compose --env-file .env.production -f ./docker/compose.prod.yml up --build --pull never`

### Reset DB Prod

`docker exec -it kanban-api-prod sh`

`pnpm dlx tsx ./src/infrastructure/persistence/db/reset`

## Running tests for API

### Unit & Integration

run `pnpm test`

### E2E

First [prepare database](#prepare-database)

then run `pnpm test:e2e`
