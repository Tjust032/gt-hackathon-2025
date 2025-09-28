from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
import psycopg2
from psycopg2.extras import RealDictCursor
import openai 
from dotenv import load_dotenv
import os
import glob
import sys
import uuid
import json
import numpy as np
from typing import List, Dict, Any

# Add the parent directory to the path to import pdf_extractor
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pdf_extractor import extract_text_from_pdf

# Load environment variables. Assumes that project contains .env file with API keys
load_dotenv()
#---- Set OpenAI API key 
# Change environment variable name from "OPENAI_API_KEY" to the name given in 
# your .env file.
openai.api_key = os.environ['OPENAI_API_KEY']

# PostgreSQL configuration
POSTGRES_CONNECTION_STRING = "postgresql://postgres:wewinning@localhost:5433/GT"
#password is wewinning
COLLECTION_NAME = "document_embeddings"
DATA_PATH = "/Users/jhonathanherrera/Georgia Tech/doc"


def simple_main():
    """Simple main function that just processes documents"""
    generate_data_store()


def test_load_documents():
    """Function to test and print out loaded documents without processing them further"""
    documents = load_documents()
    
    print(f"\n=== LOADED DOCUMENTS SUMMARY ===")
    print(f"Total documents loaded: {len(documents)}")
    
    for i, doc in enumerate(documents):
        print(f"\n--- Document {i+1} ---")
        print(f"Source: {doc.metadata.get('source', 'Unknown')}")
        
        # Print additional metadata if available
        if 'page_count' in doc.metadata:
            print(f"Pages: {doc.metadata['page_count']}")
        if 'character_count' in doc.metadata:
            print(f"Characters: {doc.metadata['character_count']}")
        
        # Print first 200 characters of content
        content_preview = doc.page_content[:200]
        if len(doc.page_content) > 200:
            content_preview += "..."
        print(f"Content preview: {content_preview}")
        print(f"Full content length: {len(doc.page_content)} characters")
    
    return documents


def test_split_text():
    """Function to test text splitting without creating the vector database"""
    documents = load_documents()
    chunks = split_text(documents)
    
    print(f"\n=== TEXT SPLITTING RESULTS ===")
    print(f"Total documents: {len(documents)}")
    print(f"Total chunks created: {len(chunks)}")
    
    # Show details about first few chunks
    for i, chunk in enumerate(chunks[:3]):  # Show first 3 chunks
        print(f"\n--- Chunk {i+1} ---")
        print(f"Document ID: {chunk.metadata.get('document_id', 'N/A')[:8]}...")
        print(f"Chunk ID: {chunk.metadata.get('chunk_id', 'N/A')[:8]}...")
        print(f"Source: {chunk.metadata.get('source', 'Unknown')}")
        print(f"Chunk length: {len(chunk.page_content)} characters")
        
        # Show first 150 characters of content
        content_preview = chunk.page_content[:150]
        if len(chunk.page_content) > 150:
            content_preview += "..."
        print(f"Content preview: {content_preview}")
    
    # Show statistics
    if chunks:
        chunk_lengths = [len(chunk.page_content) for chunk in chunks]
        print(f"\n--- Chunk Statistics ---")
        print(f"Average chunk length: {sum(chunk_lengths) / len(chunk_lengths):.1f} characters")
        print(f"Min chunk length: {min(chunk_lengths)} characters")
        print(f"Max chunk length: {max(chunk_lengths)} characters")
    
    return chunks

def test_postgres_query():
    """Test querying the PostgreSQL vector database"""
    try:
        # Initialize embeddings for query
        embeddings = OpenAIEmbeddings()
        
        print(f"\n=== TESTING POSTGRESQL QUERIES ===")
        
        test_queries = [
            "thermal characterization",
            "energy efficiency", 
            "building materials"
        ]
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        for query in test_queries:
            print(f"\n🔍 Query: '{query}'")
            
            # Generate embedding for query
            query_embedding = embeddings.embed_query(query)
            
            # First, let's just test a basic SELECT to see if vectors are stored
            print("  Testing basic SELECT...")
            basic_sql = """
            SELECT 
                chunk_id,
                document_id,
                content,
                metadata
            FROM document_chunks
            WHERE metadata::text NOT LIKE '%"type": "test"%'
            LIMIT 3
            """
            
            cur.execute(basic_sql)
            results = cur.fetchall()
            
            print(f"  Found {len(results)} real documents (non-test)")
            for i, result in enumerate(results):
                print(f"  Document {i+1}:")
                print(f"    Document ID: {result['document_id'][:8]}...")
                print(f"    Chunk ID: {result['chunk_id'][:8]}...")
                print(f"    Content: {result['content'][:100]}...")
            
            # Now try the vector similarity search
            print("  Testing vector similarity search...")
            try:
                search_sql = """
                SELECT 
                    chunk_id,
                    document_id,
                    content,
                    metadata,
                    1 - (embedding <=> %s) as similarity_score
                FROM document_chunks
                WHERE metadata::text NOT LIKE '%"type": "test"%'
                ORDER BY embedding <=> %s
                LIMIT 3
                """
                
                cur.execute(search_sql, (query_embedding, query_embedding))
                results = cur.fetchall()
                
                print(f"  Vector search found {len(results)} results:")
                for i, result in enumerate(results):
                    print(f"  Result {i+1} (Score: {result['similarity_score']:.4f}):")
                    print(f"    Document ID: {result['document_id'][:8]}...")
                    print(f"    Chunk ID: {result['chunk_id'][:8]}...")
                    print(f"    Content: {result['content'][:100]}...")
                    
            except Exception as vector_error:
                print(f"  Vector search failed: {vector_error}")
                print("  But basic SELECT works - vectors are stored!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error querying PostgreSQL: {e}")
        import traceback
        traceback.print_exc()


def fake_data():
    """Insert fake sample data into document_chunks table"""
    try:
        print("\n📝 Inserting fake data...")
        
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor()
        
        # Fake data samples
        fake_samples = [
            {
                "chunk_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "document_id": "doc-12345-abcd-6789-efgh",
                "session_id": "session-98765-4321-zyxw-vuts",
                "content": "This is my custom text content that I want to store.",
                "metadata": '{"source": "manual", "type": "custom", "user": "john"}'
            },
            {
                "chunk_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
                "document_id": "doc-67890-efgh-1234-ijkl",
                "session_id": "session-98765-4321-zyxw-vuts",
                "content": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
                "metadata": '{"source": "manual", "type": "custom", "user": "sarah"}'
            },
            {
                "chunk_id": "c3d4e5f6-g7h8-9012-cdef-345678901234",
                "document_id": "doc-11111-ijkl-5678-mnop",
                "session_id": "session-54321-9876-qrst-uvwx",
                "content": "Deep learning uses neural networks with multiple layers to process data.",
                "metadata": '{"source": "manual", "type": "custom", "user": "mike"}'
            },
            {
                "chunk_id": "d4e5f6g7-h8i9-0123-defg-456789012345",
                "document_id": "doc-22222-mnop-9012-qrst",
                "session_id": "session-54321-9876-qrst-uvwx",
                "content": "Natural language processing helps computers understand human language patterns.",
                "metadata": '{"source": "manual", "type": "custom", "user": "lisa"}'
            }
        ]
        
        # Insert fake data with mock embeddings
        insert_sql = """
        INSERT INTO document_chunks (chunk_id, document_id, session_id, content, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        for data in fake_samples:
            # Generate a mock embedding for each sample
            mock_embedding = [0.1, 0.2, 0.3, 0.4, 0.5] * 308  # 1536 dimensions
            
            cur.execute(insert_sql, (
                data["chunk_id"],
                data["document_id"],
                data["session_id"],
                data["content"],
                mock_embedding,
                data["metadata"]
            ))
            print(f"  ✅ Inserted: {data['content'][:50]}...")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("✅ Successfully inserted fake data!")
        
    except Exception as e:
        print(f"❌ Error inserting fake data: {e}")
        import traceback
        traceback.print_exc()


def insert_test_data():
    """Insert 5 test values into document_chunks table"""
    try:
        print("\n📝 Inserting 5 test values...")
        
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor()
        
        # Generate a test session ID
        test_session_id = str(uuid.uuid4())
        print(f"📋 Test Session ID: {test_session_id[:8]}...")
        
        # Test data
        test_data = [
            {
                "chunk_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
                "session_id": test_session_id,
                "content": "This is a test document about artificial intelligence and machine learning.",
                "embedding": [0.1, 0.2, 0.3, 0.4, 0.5] * 308,  # Mock embedding (1536 dims)
                "metadata": json.dumps({"source": "test_doc_1", "type": "test"})
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
                "session_id": test_session_id,
                "content": "Machine learning algorithms can learn patterns from data automatically.",
                "embedding": [0.2, 0.3, 0.4, 0.5, 0.6] * 308,
                "metadata": json.dumps({"source": "test_doc_2", "type": "test"})
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
                "session_id": test_session_id,
                "content": "Deep learning uses neural networks with multiple layers to process information.",
                "embedding": [0.3, 0.4, 0.5, 0.6, 0.7] * 308,
                "metadata": json.dumps({"source": "test_doc_3", "type": "test"})
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
                "session_id": test_session_id,
                "content": "Natural language processing helps computers understand human language.",
                "embedding": [0.4, 0.5, 0.6, 0.7, 0.8] * 308,
                "metadata": json.dumps({"source": "test_doc_4", "type": "test"})
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
                "session_id": test_session_id,
                "content": "Computer vision enables machines to interpret and understand visual information.",
                "embedding": [0.5, 0.6, 0.7, 0.8, 0.9] * 308,
                "metadata": json.dumps({"source": "test_doc_5", "type": "test"})
            }
        ]
        
        # Insert test data
        insert_sql = """
        INSERT INTO document_chunks (chunk_id, document_id, session_id, content, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        for data in test_data:
            cur.execute(insert_sql, (
                data["chunk_id"],
                data["document_id"],
                data["session_id"],
                data["content"],
                data["embedding"],
                data["metadata"]
            ))
            print(f"  ✅ Inserted: {data['content'][:50]}...")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Successfully inserted {len(test_data)} test records!")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting test data: {e}")
        return False

def select_test_data():
    """Select and display test data from document_chunks table"""
    try:
        print("\n🔍 Selecting test data from document_chunks table...")
        
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get total count
        cur.execute("SELECT COUNT(*) as total FROM document_chunks;")
        total_count = cur.fetchone()['total']
        print(f"📊 Total records in database: {total_count}")
        
        # Select test data
        cur.execute("""
            SELECT 
                chunk_id,
                document_id,
                content,
                metadata,
                created_at
            FROM document_chunks 
            WHERE metadata::text LIKE '%"type": "test"%'
            ORDER BY created_at DESC;
        """)
        
        results = cur.fetchall()
        
        print(f"\n📋 Found {len(results)} test records:")
        for i, record in enumerate(results, 1):
            print(f"\n--- Test Record {i} ---")
            print(f"Chunk ID: {record['chunk_id'][:8]}...")
            print(f"Document ID: {record['document_id'][:8]}...")
            print(f"Content: {record['content']}")
            print(f"Created: {record['created_at']}")
            
            # Parse and show metadata
            try:
                metadata = json.loads(record['metadata'])
                print(f"Source: {metadata.get('source', 'N/A')}")
                print(f"Type: {metadata.get('type', 'N/A')}")
            except:
                print(f"Metadata: {record['metadata']}")
        
        cur.close()
        conn.close()
        
        return results
        
    except Exception as e:
        print(f"❌ Error selecting test data: {e}")
        return None

def generate_data_store():
    documents = load_documents()
    chunks = split_text(documents)
    result = save_to_postgres(chunks)
    return result

def process_pdf_api(pdf_file_path):
    """Process a single PDF file for API calls"""
    print(f"🚀 Processing PDF via API: {pdf_file_path}")
    
    # Load the specific PDF file
    documents = load_documents(pdf_file_path=pdf_file_path)
    
    if not documents:
        return {"success": False, "error": "Failed to load PDF"}
    
    # Split into chunks
    chunks = split_text(documents)
    print(f"📊 Created {len(chunks)} chunks")
    
    # Save to PostgreSQL
    result = save_to_postgres(chunks)
    
    if result:
        return {
            "success": True, 
            "chunks_created": len(chunks),
            "session_id": documents[0].metadata.get("session_id"),
            "document_id": documents[0].metadata.get("document_id")
        }
    else:
        return {"success": False, "error": "Failed to save to database"}


def load_documents(pdf_file_path=None):
    # Generate a session ID for this upload batch
    session_id = str(uuid.uuid4())
    print(f"📋 Session ID for this batch: {session_id[:8]}...")
    
    documents = []
    
    if pdf_file_path:
        # Load specific PDF file (API mode)
        print(f"📄 Loading PDF from API: {pdf_file_path}")
        result = extract_text_from_pdf(pdf_file_path)
        if result["success"]:
            pdf_doc = Document(
                page_content=result["text"],
                metadata={
                    "document_id": str(uuid.uuid4()),
                    "document_type": "pdf",
                    "source": pdf_file_path,
                    "filename": os.path.basename(pdf_file_path),
                    "page_count": result["page_count"],
                    "character_count": result["character_count"],
                    "session_id": session_id
                }
            )
            documents.append(pdf_doc)
            print(f"✅ Loaded PDF: {os.path.basename(pdf_file_path)} ({result['page_count']} pages) - ID: {pdf_doc.metadata['document_id'][:8]}...")
        else:
            print(f"❌ Failed to load PDF {pdf_file_path}: {result['error']}")
            return []
    else:
        # Load from DATA_PATH (original mode)
        # Load markdown files
        loader = DirectoryLoader(DATA_PATH, glob="*.md")
        md_documents = loader.load()
        
        # Add unique IDs to markdown documents
        for doc in md_documents:
            doc.metadata["document_id"] = str(uuid.uuid4())
            doc.metadata["document_type"] = "markdown"
            doc.metadata["session_id"] = session_id
        documents.extend(md_documents)
        
        # Load PDF files
        pdf_files = glob.glob(os.path.join(DATA_PATH, "*.pdf"))
        for pdf_path in pdf_files:
            result = extract_text_from_pdf(pdf_path)
            if result["success"]:
                # Create a Document object for the PDF content with unique ID
                pdf_doc = Document(
                    page_content=result["text"],
                    metadata={
                        "document_id": str(uuid.uuid4()),
                        "document_type": "pdf",
                        "source": pdf_path,
                        "filename": os.path.basename(pdf_path),
                        "page_count": result["page_count"],
                        "character_count": result["character_count"],
                        "session_id": session_id
                    }
                )
                documents.append(pdf_doc)
                print(f"Loaded PDF: {os.path.basename(pdf_path)} ({result['page_count']} pages) - ID: {pdf_doc.metadata['document_id'][:8]}...")
            else:
                print(f"Failed to load PDF {pdf_path}: {result['error']}")
        
        print(f"Loaded {len(md_documents)} markdown files and {len(documents) - len(md_documents)} PDF files")
    
    return documents


def split_text(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    
    # Add unique chunk IDs and preserve document IDs
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = str(uuid.uuid4())
        chunk.metadata["chunk_index"] = i
        
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    
    # Show sample chunk
    if chunks:
        sample_chunk = chunks[0]
        print(f"Sample chunk ID: {sample_chunk.metadata['chunk_id'][:8]}...")
        print(f"Document ID: {sample_chunk.metadata.get('document_id', 'N/A')[:8]}...")
        print(f"Content preview: {sample_chunk.page_content[:100]}...")

    return chunks


def save_to_postgres(chunks: list[Document]):
    """Save chunks to PostgreSQL with vectors"""
    try:
        # Initialize embeddings
        embeddings = OpenAIEmbeddings()
        
        print(f"📊 Generating embeddings for {len(chunks)} chunks...")
        
        # Generate embeddings for all chunks
        texts = [chunk.page_content for chunk in chunks]
        chunk_embeddings = embeddings.embed_documents(texts)
        
        print(f"📊 Saving {len(chunks)} chunks to PostgreSQL...")
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor()
        
        # Create table with vector column
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS document_chunks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            chunk_id VARCHAR(255) UNIQUE NOT NULL,
            document_id VARCHAR(255) NOT NULL,
            session_id VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            embedding vector(1536),
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
        CREATE INDEX IF NOT EXISTS document_chunks_chunk_id_idx ON document_chunks(chunk_id);
        CREATE INDEX IF NOT EXISTS document_chunks_session_id_idx ON document_chunks(session_id);
        """
        
        # Add session_id column if it doesn't exist
        alter_table_sql = """
        ALTER TABLE document_chunks 
        ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
        """
        
        cur.execute(create_table_sql)
        conn.commit()
        
        # Add session_id column if it doesn't exist
        cur.execute(alter_table_sql)
        conn.commit()
        
        # Insert chunks with vector embeddings
        insert_sql = """
        INSERT INTO document_chunks (chunk_id, document_id, session_id, content, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (chunk_id) DO UPDATE SET
            content = EXCLUDED.content,
            embedding = EXCLUDED.embedding,
            metadata = EXCLUDED.metadata
        """
        
        for chunk, embedding in zip(chunks, chunk_embeddings):
            cur.execute(insert_sql, (
                chunk.metadata.get('chunk_id'),
                chunk.metadata.get('document_id'),
                chunk.metadata.get('session_id'),
                chunk.page_content,
                embedding,  # Store as vector
                json.dumps(chunk.metadata)
            ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Successfully saved {len(chunks)} chunks to PostgreSQL as vectors")
        
        return {"status": "success", "chunks_saved": len(chunks)}
        
    except Exception as e:
        print(f"❌ Error saving to PostgreSQL: {e}")
        return None


def main():
    """Main function with test operations"""
    print("🚀 PostgreSQL Connection and Data Test")
    print("=" * 50)
    
    # Test connection first
    try:
        conn = psycopg2.connect(POSTGRES_CONNECTION_STRING)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"✅ Connected to PostgreSQL: {version}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return
    
    # Load and process documents
    documents = load_documents()
    chunks = split_text(documents)
    result = save_to_postgres(chunks)
    
    # Insert fake data for testing
    fake_data()
    
    # Select and display test data
    #select_test_data()
    
    # Test the query functionality
    #test_postgres_query()
    
    return result

if __name__ == "__main__":
    # Uncomment the line below to test document loading
    # test_load_documents()
    
    # Test text splitting functionality
    # test_split_text()
    
    # Run the full data store generation with PostgreSQL
    result = main()