# Medical Device PDF Processing and BioBERT Embedding System

## Overview

This system implements automated PDF text extraction and BioBERT embedding for medical device documentation. When users submit a medical device listing, all PDF files are processed to extract text and generate embeddings for intelligent search and AI-powered chatbot responses.

## System Architecture

### Components

1. **PostgreSQL Database with pgvector**
   - Stores document metadata and embeddings
   - Supports vector similarity search
   - Schema includes: document_id (UUID), listing_id, original_filename, storage_url, upload_timestamp, extracted_text, embedding

2. **Python PDF Processing Service**
   - Extracts text from PDFs using PyPDF2
   - Generates 768-dimensional embeddings using BioBERT (dmis-lab/biobert-base-cased-v1.1)
   - REST API on port 5000

3. **Next.js API Routes**
   - `/api/process-pdfs` - Processes uploaded PDFs
   - `/api/documents` - Retrieves documents by listing ID

4. **Client-side Chatbot Integration**
   - Automatically fetches document text when chatbot opens
   - Injects extracted text into LLM context
   - Provides context-aware responses based on actual PDF content

## Setup Instructions

### Prerequisites

- Node.js 20+
- Python 3.8+
- PostgreSQL 14+ with pgvector extension
- OpenAI API key

### 1. Database Setup

```bash
# Install PostgreSQL and pgvector
sudo apt-get install postgresql-14 postgresql-contrib
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

Create the database:

```bash
createdb medicus
psql medicus < src/backend/src/db/schema.sql
```

### 2. Python Service Setup

```bash
cd python-service
pip install -r requirements.txt
python app.py
```

The service will start on http://localhost:5000

### 3. Backend Setup

```bash
cd src/backend
npm install
```

### 4. Frontend Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your credentials
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- Next.js frontend on http://localhost:3000
- Mastra backend on http://localhost:4111

## Workflow

### 1. Device Registration with PDF Upload

When a user submits a device registration form with PDF files:

1. A unique listing ID is generated (UUID)
2. Frontend calls `/api/process-pdfs` with:
   - `listingId`: Unique device identifier
   - `files`: Array of PDF files

3. API forwards each PDF to Python service `/extract-and-embed`
4. Python service:
   - Extracts text using PyPDF2
   - Generates 768-dim BioBERT embedding
   - Returns extracted text and embedding

5. API stores in PostgreSQL:
   ```sql
   INSERT INTO documents (
     listing_id, 
     original_filename, 
     storage_url, 
     extracted_text, 
     embedding
   ) VALUES (...)
   ```

### 2. Chatbot Document Retrieval

When a user opens the chatbot on a device page:

1. Component fetches documents:
   ```javascript
   fetch(`/api/documents?listingId=${deviceId}`)
   ```

2. API queries PostgreSQL:
   ```sql
   SELECT * FROM documents 
   WHERE listing_id = $1
   ```

3. All extracted text is combined and injected into chatbot context
4. Cedar-OS agent receives document text in its context
5. LLM responses are now informed by actual PDF content

## API Endpoints

### POST /api/process-pdfs

Process PDF files for a device listing.

**Request:**
```
Content-Type: multipart/form-data

listingId: string
files: File[]
```

**Response:**
```json
{
  "success": true,
  "processed": 3,
  "documents": [
    {
      "document_id": "uuid",
      "listing_id": "device-123",
      "original_filename": "clinical-trial.pdf",
      "storage_url": "/uploads/device-123/clinical-trial.pdf",
      "upload_timestamp": "2025-10-31T...",
      "extracted_text": "...",
      "embedding": [0.123, ...]
    }
  ]
}
```

### GET /api/documents?listingId=xxx

Retrieve all documents for a listing.

**Response:**
```json
{
  "success": true,
  "listingId": "device-123",
  "documents": [...],
  "count": 3
}
```

## Python Service API

### POST /extract-and-embed

Extract text and generate embedding from PDF.

**Request:**
```
Content-Type: multipart/form-data

file: PDF file
```

**Response:**
```json
{
  "success": true,
  "extracted_text": "Full text content...",
  "embedding": [0.123, 0.456, ...],
  "embedding_dimension": 768,
  "text_length": 5432
}
```

### GET /health

Health check endpoint.

## Database Schema

```sql
CREATE TABLE documents (
    document_id UUID PRIMARY KEY,
    listing_id VARCHAR(255) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    storage_url TEXT NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE,
    extracted_text TEXT,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_listing_id ON documents(listing_id);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
```

## Changes Made

### 1. Data Model Updates (`src/lib/mockData.ts`)
- Added `DocumentRecord` interface with required fields
- Supports UUID, listing_id, storage_url, extracted_text, and embedding

### 2. Database Layer (`src/backend/src/db/`)
- `schema.sql`: PostgreSQL schema with pgvector support
- `database.ts`: DatabaseService class for document CRUD operations

### 3. Python Service (`python-service/`)
- `app.py`: Flask service for PDF processing and BioBERT embedding
- `requirements.txt`: Python dependencies
- Uses PyPDF2 for text extraction
- Uses transformers library for BioBERT embeddings

### 4. API Routes (`src/app/api/`)
- `process-pdfs/route.ts`: Processes PDFs on device submission
- `documents/route.ts`: Retrieves documents by listing ID

### 5. Frontend Changes
- `src/app/dashboard/devices/add/page.tsx`: Calls PDF processing API on submit
- `src/app/device/[smartLinkId]/DevicePageClient.tsx`:
  - Fetches documents on mount
  - Injects document text into chatbot context
  - Uses document context for intelligent responses

## Security Considerations

1. **File Upload Validation**: Only PDF files are processed
2. **Input Sanitization**: All inputs are validated before database insertion
3. **Connection Pooling**: PostgreSQL connection pool limits prevent resource exhaustion
4. **Environment Variables**: Sensitive credentials stored in .env

## Performance Considerations

1. **BioBERT Model Loading**: Model loads once at startup (~5-10 seconds)
2. **PDF Processing**: Async processing prevents blocking
3. **Vector Indexing**: IVFFlat index enables fast similarity search
4. **Connection Pooling**: Reuses database connections

## Future Enhancements

1. **File Storage**: Integrate with S3/cloud storage for PDF files
2. **Vector Search**: Implement semantic search using embeddings
3. **Batch Processing**: Process multiple PDFs in parallel
4. **Caching**: Cache frequently accessed document embeddings
5. **Real-time Updates**: WebSocket updates for processing status

## Troubleshooting

### Python Service Not Starting
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port availability: `lsof -i :5000`

### Database Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

### PDF Processing Fails
- Verify PDF is not password-protected
- Check file size (large PDFs may timeout)
- Check Python service logs

## License

MIT License - see LICENSE file for details
