-- PostgreSQL schema for medical device documents with BioBERT embeddings

-- Enable pgvector extension for vector storage
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Listings table to track device/medicine postings with auto-incrementing ID
CREATE TABLE IF NOT EXISTS listings (
    listing_id SERIAL PRIMARY KEY,
    device_name VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents table to store PDF information and embeddings
CREATE TABLE IF NOT EXISTS documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id),
    original_filename VARCHAR(500) NOT NULL,
    storage_url TEXT NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    extracted_text TEXT,
    embedding vector(768), -- BioBERT produces 768-dimensional embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster listing_id lookups
CREATE INDEX IF NOT EXISTS idx_documents_listing_id ON documents(listing_id);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
