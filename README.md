# Run production

set .env.production based on .env.production.example

then run

`docker compose --env-file .env.production -f ./docker/compose.prod.yml up --build`
