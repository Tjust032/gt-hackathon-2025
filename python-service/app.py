"""
PDF Text Extraction and BioBERT Embedding Service

This service extracts text from PDF files using PyPDF2 and generates
embeddings using BioBERT (dmis-lab/biobert-base-cased-v1.1).
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import io
import os
from typing import List, Dict, Any

app = Flask(__name__)
CORS(app)

# Initialize BioBERT model and tokenizer
print("Loading BioBERT model...")
MODEL_NAME = "dmis-lab/biobert-base-cased-v1.1"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()
print("BioBERT model loaded successfully")


def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text content from a PDF file using PyPDF2
    
    Args:
        pdf_file: File-like object containing PDF data
        
    Returns:
        Extracted text as a string
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = []
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text:
                text_content.append(text)
        
        return "\n".join(text_content)
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def generate_biobert_embedding(text: str) -> List[float]:
    """
    Generate BioBERT embedding for the given text
    
    Args:
        text: Input text to embed
        
    Returns:
        768-dimensional embedding vector
    """
    try:
        # Tokenize input text
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Generate embeddings
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Use [CLS] token embedding as sentence representation
        # Shape: (batch_size, hidden_size) -> (1, 768)
        embedding = outputs.last_hidden_state[:, 0, :].squeeze()
        
        # Convert to list of floats
        return embedding.numpy().tolist()
    except Exception as e:
        raise Exception(f"Error generating BioBERT embedding: {str(e)}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": MODEL_NAME})


@app.route('/extract-and-embed', methods=['POST'])
def extract_and_embed():
    """
    Extract text from PDF and generate BioBERT embedding
    
    Expected form data:
        - file: PDF file
        
    Returns:
        JSON with extracted_text and embedding
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400
        
        # Extract text from PDF
        pdf_content = io.BytesIO(file.read())
        extracted_text = extract_text_from_pdf(pdf_content)
        
        if not extracted_text.strip():
            return jsonify({"error": "No text could be extracted from PDF"}), 400
        
        # Generate BioBERT embedding
        embedding = generate_biobert_embedding(extracted_text)
        
        return jsonify({
            "success": True,
            "extracted_text": extracted_text,
            "embedding": embedding,
            "embedding_dimension": len(embedding),
            "text_length": len(extracted_text)
        })
        
    except Exception as e:
        # Log the actual error for debugging
        app.logger.error(f"Error in extract-and-embed: {str(e)}", exc_info=True)
        # Return generic error message to user
        return jsonify({"error": "Failed to process PDF file"}), 500


@app.route('/embed-text', methods=['POST'])
def embed_text():
    """
    Generate BioBERT embedding for provided text
    
    Expected JSON:
        - text: Text to embed
        
    Returns:
        JSON with embedding
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        # Generate BioBERT embedding
        embedding = generate_biobert_embedding(text)
        
        return jsonify({
            "success": True,
            "embedding": embedding,
            "embedding_dimension": len(embedding)
        })
        
    except Exception as e:
        # Log the actual error for debugging
        app.logger.error(f"Error in embed-text: {str(e)}", exc_info=True)
        # Return generic error message to user
        return jsonify({"error": "Failed to generate embedding"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
