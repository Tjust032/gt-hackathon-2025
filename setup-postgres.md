# PostgreSQL Setup Guide for Windows

## Step 1: Install PostgreSQL

### Option A: Using Chocolatey (Recommended - Fast)
If you have Chocolatey installed:
```powershell
choco install postgresql14 -y
```

### Option B: Official Installer (Manual)
1. Download PostgreSQL 14+ from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for postgres user (remember this!)
   - Default port: 5432 (keep default)
   - Select "pgAdmin" and "Command Line Tools"

### Option C: Use Docker (Alternative)
```bash
docker run --name medicus-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=medicus -p 5432:5432 -d postgres:14
```

## Step 2: Add PostgreSQL to PATH

After installing, add PostgreSQL bin directory to your PATH:
1. Open System Environment Variables
2. Edit PATH variable
3. Add: `C:\Program Files\PostgreSQL\14\bin` (adjust version as needed)
4. Restart PowerShell

Or run this in PowerShell (as Administrator):
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\14\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
```

## Step 3: Verify Installation

```powershell
psql --version
# Should output: psql (PostgreSQL) 14.x
```

## Step 4: Create Database

```powershell
# Connect to PostgreSQL (password: postgres or what you set)
psql -U postgres

# In psql prompt:
CREATE DATABASE medicus;
\q
```

## Step 5: Install pgvector Extension

### Windows Installation
Unfortunately, pgvector needs to be compiled for Windows. You have two options:

#### Option 1: Use Docker (Easiest for pgvector)
```bash
docker run --name medicus-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medicus \
  -p 5432:5432 \
  -d pgvector/pgvector:pg14
```

#### Option 2: Prebuilt Windows Binary
1. Download prebuilt pgvector DLL from: https://github.com/pgvector/pgvector/releases
2. Copy to PostgreSQL extension directory
3. Run in psql: `CREATE EXTENSION vector;`

#### Option 3: Skip pgvector for now (For Testing)
The app will work without vector similarity search, you just won't have semantic search capabilities. The text extraction and chatbot will still work!

## Step 6: Run Schema

```powershell
# From project root
psql -U postgres -d medicus -f src/backend/src/db/schema.sql
```

If pgvector is not installed, comment out the vector-related lines in schema.sql temporarily.

## Step 7: Configure Environment Variables

Add to your `.env` file:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medicus
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres  # Change to your password
```

## Verify Everything Works

```powershell
# Connect to database
psql -U postgres -d medicus

# Check tables exist
\dt

# Should show:
# listings
# documents
```

---

## Quick Start with Docker (Recommended for Development)

If you have Docker, this is the fastest way:

```bash
# Start PostgreSQL with pgvector
docker run -d \
  --name medicus-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medicus \
  -p 5432:5432 \
  pgvector/pgvector:pg14

# Wait 5 seconds for startup
timeout /t 5

# Run schema
psql -h localhost -U postgres -d medicus -f src/backend/src/db/schema.sql
```

Then add to `.env`:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medicus
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```



