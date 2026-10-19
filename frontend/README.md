# Student Document Portal Frontend

See the [project README](../README.md) for the complete setup, API endpoint list, and demo accounts.

## Run the frontend

From this directory:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` if the Laravel API is not available at `http://127.0.0.1:8000/api`.

## Checks

```powershell
npm run lint
npm run build
```
