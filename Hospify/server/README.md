# Hospify Server

Production-oriented Node.js, Express, and TypeScript foundation for the Hospify Hospital Management System.

The server currently exposes only a health check. Authentication, domain logic, persistence, and additional APIs are intentionally not implemented.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

The default address is `http://localhost:3000`.

## Scripts

- `npm run dev` starts the TypeScript server in watch mode.
- `npm run typecheck` validates TypeScript without emitting files.
- `npm run build` compiles the application to `dist/`.
- `npm start` runs the compiled production server.
- `npm run clean` removes compiled output.

## API

### `GET /health`

Returns HTTP `200` with:

```json
{
  "status": "ok"
}
```

## Architecture

- `config/` contains environment and infrastructure configuration.
- `controllers/` will translate HTTP requests and responses by domain.
- `routes/` defines HTTP routes.
- `middleware/` will contain shared Express middleware.
- `services/` will hold application and domain orchestration.
- `repositories/` will isolate persistence access.
- `models/` will contain domain and persistence models.
- `validators/` will validate incoming data.
- `interfaces/` and `types/` contain shared TypeScript contracts.
- `utils/` contains reusable helpers.
- `constants/` contains immutable shared values.

Keep controllers thin, place business rules in services, and access persistence through repositories. Never commit `.env` or secrets.
