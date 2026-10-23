# Reddit Discussions Index

An index mapping episodes and movies to corresponding Reddit discussion posts. **Currently only targetting Anime**.

## Development

To develop on this repository, clone it then follow these instructions:

1. Create a `.env` file based on `.env.example` and replace placeholder values. Particularly, properly set the `NODE_ENV` variable to have logs pretty-printed during development.
2. Set up a PostgreSQL database. With Docker installed, a single `docker compose up -d` works.
3. Run the following commands:

   ```sh
   pnpm install
   docker compose up -d # needs Docker installed
   pnpm dev
   ```
