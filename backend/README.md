# Student Document Portal API

See the [project README](../README.md) for setup, database configuration, demo accounts, and API documentation.

## Run the API

From this directory:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Set the MySQL connection in `.env` before migrating. The seeded demonstration accounts are for local development only; change their passwords for any deployed environment.

## Run tests

```powershell
php artisan test
```
