# PostgreSQL Setup with Docker

## Prerequisites

Make sure you have Docker Desktop installed:
- Download: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop

## Quick Start (3 Simple Steps)

### Step 1: Start PostgreSQL with Docker

Open PowerShell in your project root and run:

```powershell
docker compose up -d
```

This will:
- ✅ Download PostgreSQL with pgvector extension
- ✅ Create the `medicus` database
- ✅ Automatically run `schema.sql` to create tables
- ✅ Start the database on port 5432

### Step 2: Verify Database is Running

```powershell
docker compose ps
```

You should see `medicus-postgres` with status "Up"

### Step 3: Update Your .env File

Create a `.env` file in your project root:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medicus
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Python Service URL
PYTHON_SERVICE_URL=http://localhost:5000

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Useful Docker Commands

### View Database Logs
```powershell
docker compose logs postgres
```

### Stop Database
```powershell
docker compose down
```

### Stop and Delete All Data (Fresh Start)
```powershell
docker compose down -v
```

### Connect to Database (psql)
```powershell
docker exec -it medicus-postgres psql -U postgres -d medicus
```

Once connected, you can run SQL commands:
```sql
-- List all tables
\dt

-- View listings table
SELECT * FROM listings;

-- View documents table
SELECT * FROM documents;

-- Exit
\q
```

## Verify Schema

After starting Docker, verify the tables were created:

```powershell
docker exec -it medicus-postgres psql -U postgres -d medicus -c "\dt"
```

You should see:
- `listings` table
- `documents` table

## Troubleshooting

### Port 5432 Already in Use
If you have another PostgreSQL instance running, either:
1. Stop it: `Stop-Service postgresql-x64-XX` (in Admin PowerShell)
2. Or change the port in `docker-compose.yml` to `5433:5432` and restart with `docker compose up -d`

### Docker Not Running
Make sure Docker Desktop is started and running.

### Schema Not Applied
If tables aren't created, manually apply the schema:

```powershell
docker exec -i medicus-postgres psql -U postgres -d medicus < src/backend/src/db/schema.sql
```

## Next Steps

Once PostgreSQL is running:
1. ✅ Database is ready
2. → Update API endpoints to use the database
3. → Run the full application stack

