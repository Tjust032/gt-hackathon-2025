# Deployment Guide

This guide provides step-by-step instructions for deploying the PDF Processing system with BioBERT embeddings and PostgreSQL.

## Prerequisites

- Ubuntu/Debian Linux (or similar)
- PostgreSQL 14+ with superuser access
- Python 3.8+
- Node.js 20+
- At least 5GB free disk space (for ML models)
- OpenAI API key

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
./deploy.sh
```

The script will:
1. Check prerequisites
2. Install pgvector extension
3. Create and configure PostgreSQL database
4. Set up Python virtual environment
5. Install all dependencies
6. Configure environment variables

### Option 2: Manual Deployment

Follow these steps if you prefer manual setup or encounter issues with the automated script.

---

## Step 1: Install PostgreSQL with pgvector

### Install PostgreSQL

```bash
sudo apt-get update
sudo apt-get install postgresql-14 postgresql-contrib
```

### Install pgvector extension

```bash
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

---

## Step 2: Create Database

### Create the database

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE medicus;
\q
```

### Apply the schema

```bash
cd /path/to/gt-hackathon-2025
sudo -u postgres psql -d medicus -f src/backend/src/db/schema.sql
```

### Verify the setup

```bash
sudo -u postgres psql -d medicus
```

In PostgreSQL:

```sql
-- Check tables
\dt

-- Should show:
--  public | documents | table | postgres
--  public | listings  | table | postgres

-- Check extensions
\dx

-- Should show pgvector and uuid-ossp

-- Verify listings table
SELECT * FROM listings;

-- Verify documents table structure
\d documents

\q
```

---

## Step 3: Set Up Python Service

### Create virtual environment

```bash
cd python-service
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies

**Note:** This will download ~2.5GB of dependencies (PyTorch, Transformers, BioBERT model).

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This may take 5-10 minutes depending on your internet connection.

### Test Python service

```bash
python app.py
```

You should see:
```
Loading BioBERT model...
BioBERT model loaded successfully
 * Running on http://0.0.0.0:5000
```

Test the health endpoint in another terminal:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model": "dmis-lab/biobert-base-cased-v1.1"
}
```

Keep this service running, or press Ctrl+C to stop and continue setup.

---

## Step 4: Configure Environment Variables

### Create .env file

```bash
cd /path/to/gt-hackathon-2025
cp .env.example .env
```

### Edit .env file

```bash
nano .env
```

Update with your credentials:

```bash
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medicus
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password

# Python PDF Processing Service
PYTHON_SERVICE_URL=http://localhost:5000

# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-api-key
```

Save and exit (Ctrl+X, then Y, then Enter).

---

## Step 5: Install Node.js Dependencies

### Install frontend dependencies

```bash
npm install
```

### Install backend dependencies

```bash
cd src/backend
npm install
cd ../..
```

---

## Step 6: Start Services

You'll need **3 terminal windows** for the services.

### Terminal 1: Python PDF Processing Service

```bash
cd python-service
source venv/bin/activate
python app.py
```

Leave this running. It should show:
```
Loading BioBERT model...
BioBERT model loaded successfully
 * Running on http://0.0.0.0:5000
```

### Terminal 2: Application (Frontend + Backend)

```bash
npm run dev
```

This starts both:
- Next.js frontend on http://localhost:3000
- Mastra backend on http://localhost:4111

### Terminal 3: Testing (optional)

You can use this terminal for testing and monitoring.

---

## Step 7: Verify Deployment

### Test the application

1. Open browser to http://localhost:3000
2. Navigate to "Add New Device" (http://localhost:3000/dashboard/devices/add)
3. Fill in device information
4. Upload a PDF file
5. Click Submit

### Verify database

```bash
sudo -u postgres psql -d medicus
```

Check listings and documents:

```sql
-- Check listings (should increment: 1, 2, 3, ...)
SELECT * FROM listings ORDER BY listing_id;

-- Check documents
SELECT document_id, listing_id, original_filename, 
       LENGTH(extracted_text) as text_length,
       array_length(embedding, 1) as embedding_dim
FROM documents;
```

Expected output:
- `listing_id` should be sequential numbers: 1, 2, 3, ...
- `text_length` should show extracted text size
- `embedding_dim` should be 768

---

## Troubleshooting

### Python Service Issues

**Problem:** BioBERT model download fails

**Solution:**
```bash
# Pre-download model manually
python3 -c "from transformers import AutoModel, AutoTokenizer; AutoModel.from_pretrained('dmis-lab/biobert-base-cased-v1.1'); AutoTokenizer.from_pretrained('dmis-lab/biobert-base-cased-v1.1')"
```

**Problem:** Port 5000 already in use

**Solution:**
```bash
# Change port in .env
PYTHON_SERVICE_URL=http://localhost:5001

# Update python-service/app.py last line:
port = int(os.environ.get('PORT', 5001))
```

### PostgreSQL Issues

**Problem:** Cannot connect to database

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Enable autostart
sudo systemctl enable postgresql
```

**Problem:** pgvector extension not found

**Solution:**
```bash
# Reinstall pgvector
cd /tmp/pgvector
sudo make install

# Then in PostgreSQL:
sudo -u postgres psql -d medicus
CREATE EXTENSION vector;
```

### Application Issues

**Problem:** Frontend can't connect to Python service

**Solution:**
```bash
# Verify Python service is running
curl http://localhost:5000/health

# Check .env has correct PYTHON_SERVICE_URL
cat .env | grep PYTHON_SERVICE_URL

# Check for CORS issues in browser console
```

**Problem:** Listing ID not incrementing

**Solution:**
```bash
# Verify listings table exists
sudo -u postgres psql -d medicus -c "\d listings"

# Check sequence
sudo -u postgres psql -d medicus -c "SELECT last_value FROM listings_listing_id_seq;"
```

---

## Production Deployment

For production deployment, consider:

1. **Use a managed PostgreSQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Deploy Python service as a separate container** (Docker)
3. **Use a model serving platform** (TensorFlow Serving, Triton)
4. **Set up file storage** (AWS S3, Google Cloud Storage)
5. **Add monitoring** (Prometheus, Grafana)
6. **Set up SSL/TLS** (Let's Encrypt, Cloudflare)
7. **Configure CORS properly** for production domains

---

## Security Considerations

1. Change default PostgreSQL password
2. Use strong passwords in .env
3. Don't commit .env to version control
4. Use environment-specific .env files
5. Enable PostgreSQL SSL connections
6. Set up firewall rules for port access
7. Use API rate limiting
8. Implement authentication/authorization

---

## Performance Optimization

1. **BioBERT Model Caching**: The model is loaded once at startup
2. **Database Connection Pooling**: Configured in database.ts
3. **Vector Index**: IVFFlat index for fast similarity search
4. **Batch Processing**: Process multiple PDFs in parallel

---

## Monitoring

### Check service health

```bash
# Python service
curl http://localhost:5000/health

# Next.js
curl http://localhost:3000/api/health (if implemented)

# PostgreSQL
sudo -u postgres psql -d medicus -c "SELECT COUNT(*) FROM listings;"
```

### View logs

```bash
# Python service logs (in Terminal 1)
# Application logs (in Terminal 2)

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## Uninstalling

To remove the deployment:

```bash
# Stop services (Ctrl+C in all terminals)

# Remove database
sudo -u postgres psql -c "DROP DATABASE medicus;"

# Remove Python virtual environment
rm -rf python-service/venv

# Remove node_modules (optional)
rm -rf node_modules src/backend/node_modules
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs from all three services
3. Verify all prerequisites are installed
4. Check environment variables in .env

---

**Deployment Status Checklist:**

- [ ] PostgreSQL 14+ installed
- [ ] pgvector extension installed
- [ ] Database 'medicus' created
- [ ] Schema applied (listings and documents tables exist)
- [ ] Python 3.8+ installed
- [ ] Python dependencies installed (~2.5GB)
- [ ] BioBERT model downloaded
- [ ] Node.js 20+ installed
- [ ] Node dependencies installed
- [ ] .env file configured
- [ ] Python service running on port 5000
- [ ] Application running on port 3000
- [ ] Can create listing and get sequential ID (1, 2, 3, ...)
- [ ] Can upload PDF and see it processed
- [ ] Can view document in database with embedding

Once all items are checked, your deployment is complete!
