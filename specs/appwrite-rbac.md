# Appwrite RBAC Plan

This app now uses Appwrite user labels as the primary role primitive for application access control.

## Current role model

- Supported app roles: `faculty`, `panelist`
- Default role for new registrations: `faculty`
- Source of truth in Appwrite Auth:
  - User label: `faculty` or `panelist`
  - User prefs mirror: `{ role: "faculty" | "panelist" }`
- Auth API response includes `account.role` so the frontend can branch by role without making an extra request.

## Why this shape

This follows Appwrite's recommended access model:

- Auth labels are first-class RBAC inputs and can be used in permissions via `Role.label('<label>')`.
- Row security should stay enabled on application tables, with permissions attached per row.
- User-owned records should include user-level permissions with `Role.user('<USER_ID>')`.

## Recommended row-level patterns

For faculty-owned rows:

```ts
[
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

For panelist-reviewable rows:

```ts
[
  Permission.read(Role.user(ownerUserId)),
  Permission.read(Role.label('panelist')),
  Permission.update(Role.label('panelist')),
]
```

For mixed ownership and role review:

```ts
[
  Permission.read(Role.user(ownerUserId)),
  Permission.update(Role.user(ownerUserId)),
  Permission.read(Role.label('panelist')),
]
```

## Database prerequisites

- Keep row security enabled on every app table that stores user data.
- Grant only the minimum table-level create access needed.
- Put row permissions on create so access is explicit from the first write.

## Current environment note

- `user_profiles` is now the verified app-side profile table.
- Appwrite Auth labels and prefs remain the live role source during sign-in and route protection.
- The `user_profiles.role` column mirrors that Appwrite role after successful email verification so verified users have a clean app-side profile record.
- `user_profiles` should keep row security enabled and stay server-managed unless the app later adds a direct client read path with explicit row permissions.
