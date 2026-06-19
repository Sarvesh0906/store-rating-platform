# Store Rating Platform

Full-stack store rating application with three roles:

- `SYSTEM_ADMIN` manages users and stores
- `NORMAL_USER` browses stores and submits ratings
- `STORE_OWNER` views ratings for the store they own

The database schema is already created in NeonDB using PostgresSQL.

## Project Layout

- `backend/` Node.js + Express API
- `frontend/` React + Vite client

## Environment

Create the following environment files:

- `backend/.env`
- `frontend/.env`

Use the sample files as a base:

- `backend/.env.example`
- `frontend/.env.example`

## Backend Setup

From `backend/`:

```bash
npm install
npm run dev
```

## Frontend Setup

From `frontend/`:

```bash
npm install
npm run dev
```


