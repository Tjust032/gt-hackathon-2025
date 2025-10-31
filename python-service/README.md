# Python PDF Processing and BioBERT Embedding Service

This service extracts text from PDF files using PyPDF2 and generates embeddings using BioBERT.

## Setup

1. Install Python dependencies:
```bash
cd python-service
pip install -r requirements.txt
```

2. Run the service:
```bash
python app.py
```

The service will start on port 5000 by default.

## Endpoints

### POST /extract-and-embed
Extract text from a PDF file and generate BioBERT embedding.

**Request:**
- Content-Type: multipart/form-data
- Body: file (PDF file)

**Response:**
```json
{
  "success": true,
  "extracted_text": "...",
  "embedding": [0.123, 0.456, ...],
  "embedding_dimension": 768,
  "text_length": 1234
}
```

### POST /embed-text
Generate BioBERT embedding for provided text.

**Request:**
```json
{
  "text": "Your text here"
}
```

**Response:**
```json
{
  "success": true,
  "embedding": [0.123, 0.456, ...],
  "embedding_dimension": 768
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model": "dmis-lab/biobert-base-cased-v1.1"
}
```
