# API Auth Service

Express-based authentication service providing signup, login, email verification and password reset endpoints.

## Running

```bash
pnpm install
node apps/api-auth/src/index.ts
```

Environment variables:

- `USER_TABLE` – DynamoDB table name for users
- `JWT_SECRET` – secret used to sign tokens

## Endpoints

- `POST /signup`
- `POST /login`
- `POST /verify`
- `POST /requestPasswordReset`
- `POST /resetPassword`
- `POST /changeEmail`
