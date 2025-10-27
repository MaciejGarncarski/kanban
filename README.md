# Run production locally

set .env.production based on .env.production.example

then run

`docker compose --env-file .env.production -f ./docker/compose.prod.yml up --build --pull never`

# Reset DB Prod

`docker exec -it kanban-api-prod sh`
`pnpm dlx tsx ./src/infrastructure/persistence/db/reset`
