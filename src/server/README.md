# Server Structure

The server layer is organized by **shared infrastructure** and **feature-scoped modules**.

## Layout

```text
src/server/
  middlewares/
    request-context.ts
    request-logger.ts
  plugins/
    appwrite.server.ts
  schema/
    index.ts
    tables.ts
    types.ts
  shared/
    config.server.ts
    errors.server.ts
  types/
    logger.ts
    request.ts
  utils/
    env.server.ts
    http.server.ts
    request.ts
  features/
    auth/
      accounts-service.server.ts
      cookies.server.ts
      legacy-accounts.server.ts
      passwords.server.ts
      routes.server.ts
      runtime.server.ts
      schemas.ts
```

## Conventions

- Put cross-cutting request behavior in `middlewares/`.
- Put external service adapters and SDK clients in `plugins/`.
- Put reusable server infrastructure in `shared/`.
- Put Appwrite table definitions and server-side schema metadata in `schema/`.
- Put small reusable helpers in `utils/`.
- Put server-only contracts in `types/`.
- Put business logic that belongs to a product area in `features/<feature>/`.
- Keep `.server.ts` files server-only.
- Keep request validation close to the feature that owns the route.
- Let route files import feature handlers instead of reaching into shared infrastructure directly.

## Global Middleware

Global request middleware is registered in [src/start.ts](/home/zynex/dev/fsme/src/start.ts).
That keeps request-level concerns like tracing and logging out of feature handlers.
