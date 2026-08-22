# Supplier Management System — Codex Instructions

## Project Goal

Build a production-quality supplier management system for managing suppliers, their contact information, and future supplier-related business operations.

Do not replace the existing architecture without a concrete technical reason.

---

## Current Backend Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Prisma PostgreSQL adapter
- dotenv
- CORS
- Nodemon

---

## Backend Architecture

Maintain this request flow:

Client
→ Route
→ Controller
→ Service
→ Prisma
→ PostgreSQL

Responsibilities must remain separated.

### Routes

Routes define API endpoints and connect them to controllers.

Routes should NOT contain database queries or business logic.

Location:

backend/routes/

### Controllers

Controllers handle HTTP requests and responses.

Controllers should:

- read request parameters/body
- call the appropriate service
- return HTTP responses
- handle HTTP-level errors

Controllers should NOT directly query Prisma.

Location:

backend/controllers/

### Services

Services contain application/business logic and database operations.

Prisma queries belong here.

Location:

backend/services/

### Database

Prisma is the database access layer.

Schema:

backend/prisma/schema.prisma

Database:

PostgreSQL

---

## Existing Supplier API

Existing functionality must continue working.

POST /suppliers

Creates a supplier.

GET /suppliers

Returns all suppliers.

Do not break these endpoints while adding new functionality.

---

## Development Rules

1. Inspect existing code before modifying it.

2. Preserve working functionality unless a change is necessary.

3. Do not silently rewrite the project architecture.

4. Prefer small, testable changes over large rewrites.

5. Add useful comments explaining the purpose of each important section of code.

6. Do not add comments that merely repeat obvious JavaScript syntax.

7. Never hard-code database passwords, API keys, tokens, or other secrets.

8. Never commit `.env`.

9. Use environment variables for configuration and secrets.

10. Validate incoming API data before sending it to Prisma.

11. Use appropriate HTTP status codes.

12. Add error handling to asynchronous controllers.

13. Return useful JSON error responses rather than raw stack traces.

14. Keep naming consistent across routes, controllers, services, and Prisma models.

15. Do not install unnecessary dependencies.

---

## Error Handling

When an error is encountered:

1. Identify the exact error.
2. Explain the likely cause.
3. State which file or subsystem is responsible.
4. Fix it only after understanding the cause.
5. Report the error and the implemented fix.
6. Do not hide errors with empty catch blocks or silent fallbacks.

---

## Prisma Rules

Before changing the Prisma schema:

1. Inspect the existing schema.
2. Determine whether the change requires a migration.
3. Preserve existing data whenever reasonably possible.
4. Generate/apply the appropriate migration.
5. Regenerate Prisma Client when required.
6. Verify existing Supplier operations still work.

Never reset or delete the database merely to make a migration succeed unless explicitly authorized.

---

## Git Rules

Work from the existing Git repository.

Do not commit:

- `.env`
- `node_modules`
- credentials
- secrets
- generated temporary files

Keep commits focused and descriptive.

Do not force-push or rewrite Git history unless explicitly requested.

---

## Working Method

For each feature:

1. Inspect the relevant existing files.
2. Explain the implementation plan.
3. Implement the smallest coherent change.
4. Check for syntax/runtime errors.
5. Test the affected API behavior where possible.
6. Verify existing functionality was not broken.
7. Report:
   - files changed
   - functionality added
   - tests/checks performed
   - errors encountered
   - unresolved problems

Do not claim something works unless it has actually been verified.

---

## Current Priority

Continue developing the Supplier CRUD API without breaking the existing Create and Read-All operations.

Likely next operations include:

GET /suppliers/:id
PUT /suppliers/:id
DELETE /suppliers/:id

Implement these using the existing:

Route
→ Controller
→ Service
→ Prisma

architecture.