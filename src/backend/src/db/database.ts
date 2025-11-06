import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'medicus',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface DocumentRecord {
  document_id: string;
  listing_id: number; // Changed to number (auto-increment)
  original_filename: string;
  storage_url: string;
  upload_timestamp: Date;
  extracted_text?: string;
  embedding?: number[];
}

export interface ListingRecord {
  listing_id: number; // Auto-incrementing SERIAL
  drug_name: string;
  generic_name: string;
  manufacturer: string;
  ndc_code: string;
  dosage_form: string;
  strength: string;
  route_of_administration: string;
  active_ingredient: string;
  therapeutic_class: string;
  prescription_required: boolean;
  controlled_substance_schedule?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DrugData {
  drugName: string;
  genericName: string;
  manufacturer: string;
  ndcCode: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  activeIngredient: string;
  therapeuticClass: string;
  prescriptionRequired: boolean;
  controlledSubstanceSchedule?: string;
}

export class DatabaseService {
  /**
   * Create a new listing and return the auto-generated ID
   */
  async createListing(drugData: DrugData): Promise<number> {
    const query = `
      INSERT INTO listings (
        drug_name, generic_name, manufacturer, ndc_code, dosage_form,
        strength, route_of_administration, active_ingredient,
        therapeutic_class, prescription_required, controlled_substance_schedule
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING listing_id
    `;

    const result = await pool.query(query, [
      drugData.drugName,
      drugData.genericName,
      drugData.manufacturer,
      drugData.ndcCode,
      drugData.dosageForm,
      drugData.strength,
      drugData.routeOfAdministration,
      drugData.activeIngredient,
      drugData.therapeuticClass,
      drugData.prescriptionRequired,
      drugData.controlledSubstanceSchedule || null,
    ]);
    return result.rows[0].listing_id;
  }

  /**
   * Insert a new document record
   */
  async insertDocument(
    listingId: number, // Changed from string to number
    filename: string,
    storageUrl: string,
    extractedText?: string,
    embedding?: number[],
  ): Promise<DocumentRecord> {
    const query = `
      INSERT INTO documents (listing_id, original_filename, storage_url, extracted_text, embedding)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const embeddingStr = embedding ? `[${embedding.join(',')}]` : null;

    const result = await pool.query(query, [
      listingId,
      filename,
      storageUrl,
      extractedText,
      embeddingStr,
    ]);

    return this.mapRowToDocument(result.rows[0]);
  }

  /**
   * Get all documents for a listing
   */
  async getDocumentsByListingId(listingId: number): Promise<DocumentRecord[]> {
    const query = `
      SELECT * FROM documents
      WHERE listing_id = $1
      ORDER BY upload_timestamp DESC
    `;

    const result = await pool.query(query, [listingId]);
    return result.rows.map((row) => this.mapRowToDocument(row));
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId: string): Promise<DocumentRecord | null> {
    const query = `
      SELECT * FROM documents
      WHERE document_id = $1
    `;

    const result = await pool.query(query, [documentId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDocument(result.rows[0]);
  }

  /**
   * Map database row to DocumentRecord
   */
  private mapRowToDocument(row: {
    document_id: string;
    listing_id: number; // Changed to number
    original_filename: string;
    storage_url: string;
    upload_timestamp: Date;
    extracted_text?: string;
    embedding?: string;
  }): DocumentRecord {
    return {
      document_id: row.document_id,
      listing_id: row.listing_id,
      original_filename: row.original_filename,
      storage_url: row.storage_url,
      upload_timestamp: row.upload_timestamp,
      extracted_text: row.extracted_text,
      embedding: row.embedding ? this.parseVector(row.embedding) : undefined,
    };
  }

  /**
   * Parse PostgreSQL vector to number array
   */
  private parseVector(vectorStr: string): number[] {
    // PostgreSQL returns vectors as "[1,2,3]" strings
    if (!vectorStr) return [];
    return JSON.parse(vectorStr);
  }

  /**
   * Close the pool (for cleanup)
   */
  async close(): Promise<void> {
    await pool.end();
  }
}

export const dbService = new DatabaseService();
