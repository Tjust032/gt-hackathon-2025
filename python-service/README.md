# Python PDF Processing and BioBERT Embedding Service

This service extracts text from PDF files using PyPDF2 and generates embeddings using BioBERT.

## Setup

**Note:** This service requires large ML packages (torch ~2GB, transformers ~500MB). 
First-time installation may take several minutes. Ensure you have sufficient disk space.

For production deployment, consider:
- Using a smaller model or quantized version
- Pre-loading the model in a Docker image
- Using a model serving platform (e.g., TensorFlow Serving, Triton)

1. Install Python dependencies:
```bash
cd python-service
pip install -r requirements.txt
```

2. Run the service:
```bash
python app.py
```

The service will start on port 5000 by default. First startup will download the BioBERT model (~400MB), which may take a few minutes.

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
