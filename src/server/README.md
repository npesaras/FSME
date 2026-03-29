# Server Structure

The server layer is organized by **shared infrastructure** and **feature-scoped modules**.

## Layout

```text
src/server/
  shared/
    appwrite.server.ts
    config.server.ts
    errors.server.ts
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

- Put reusable server infrastructure in `shared/`.
- Put business logic that belongs to a product area in `features/<feature>/`.
- Keep `.server.ts` files server-only.
- Keep request validation close to the feature that owns the route.
- Let route files import feature handlers instead of reaching into shared infrastructure directly.
