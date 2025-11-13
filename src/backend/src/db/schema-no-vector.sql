-- PostgreSQL schema for prescription drug documents (without pgvector)
-- This version works without pgvector extension for easier Windows setup
-- Vector similarity search will be limited, but text extraction and chatbot will work

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Listings table to track prescription drug postings with auto-incrementing ID
CREATE TABLE IF NOT EXISTS listings (
    listing_id SERIAL PRIMARY KEY,
    drug_name VARCHAR(500),
    generic_name VARCHAR(500),
    manufacturer VARCHAR(500),
    ndc_code VARCHAR(20),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    route_of_administration VARCHAR(100),
    active_ingredient VARCHAR(500),
    therapeutic_class VARCHAR(200),
    prescription_required BOOLEAN DEFAULT true,
    controlled_substance_schedule VARCHAR(10),
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
    embedding_json TEXT, -- Store embeddings as JSON text instead of vector type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster listing_id lookups
CREATE INDEX IF NOT EXISTS idx_documents_listing_id ON documents(listing_id);

-- Success message
SELECT 'Database schema created successfully!' as status;



