const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/trusiq";

const pool = new Pool({
  connectionString,
  ssl:
    process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function getDb() {
  return pool;
}

async function saveDb() {
  return true;
}

async function initDb() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone_number TEXT,
        profile_image TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        roles TEXT DEFAULT '[]',
        company_id TEXT,
        account_status TEXT NOT NULL DEFAULT 'active',
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        owner_id TEXT,
        business_name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        phone TEXT,
        email TEXT,
        website TEXT,
        location TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        verification_level TEXT NOT NULL DEFAULT 'unverified',
        trust_score DOUBLE PRECISION DEFAULT 0,
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        slug TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        verified_visit BOOLEAN NOT NULL DEFAULT FALSE,
        review_status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await client.query(
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_hash TEXT`,
    );
    await client.query(
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hash_metadata JSONB DEFAULT '{}'::jsonb`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS review_media (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL,
        media_url TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (review_id) REFERENCES reviews(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS voice_reviews (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL UNIQUE,
        audio_url TEXT NOT NULL,
        transcript TEXT,
        duration_seconds INTEGER,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (review_id) REFERENCES reviews(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        qr_token TEXT NOT NULL UNIQUE,
        qr_image_url TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS verified_visits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        qr_code_id TEXT,
        visit_time TIMESTAMPTZ DEFAULT NOW(),
        verification_status BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS trust_scores (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL UNIQUE,
        business_id TEXT,
        score DOUBLE PRECISION NOT NULL,
        percentile INTEGER DEFAULT 0,
        average_rating DOUBLE PRECISION,
        verified_review_ratio DOUBLE PRECISION,
        ai_authenticity_score DOUBLE PRECISION,
        metrics JSONB DEFAULT '{}'::jsonb,
        trajectory JSONB DEFAULT '[]'::jsonb,
        calculated_at TIMESTAMPTZ DEFAULT NOW(),
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        submitted_by TEXT NOT NULL,
        request_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ,
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        FOREIGN KEY (submitted_by) REFERENCES users(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_documents (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        document_url TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL UNIQUE,
        sentiment_score DOUBLE PRECISION,
        fake_review_probability DOUBLE PRECISION,
        ai_summary TEXT,
        strengths TEXT,
        weaknesses TEXT,
        analyzed_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (review_id) REFERENCES reviews(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS blockchain_records (
        id TEXT PRIMARY KEY,
        record_type TEXT NOT NULL,
        reference_id TEXT NOT NULL,
        hash_value TEXT,
        transaction_hash TEXT,
        block_number BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS review_reports (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL,
        reported_by TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (review_id) REFERENCES reviews(id),
        FOREIGN KEY (reported_by) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_responses (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        response_text TEXT NOT NULL,
        responded_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (review_id) REFERENCES reviews(id),
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS company_profiles (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL UNIQUE,
        owner_id TEXT,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL DEFAULT 'General',
        location TEXT,
        website TEXT,
        phone TEXT,
        description TEXT,
        trust_score DOUBLE PRECISION DEFAULT 0,
        rating DOUBLE PRECISION DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (company_id) REFERENCES businesses(id),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    const adminEmail = (process.env.ADMIN_EMAIL || "baidoeekow3690@gmail.com")
      .trim()
      .toLowerCase();
    const adminPasswordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "#EncyclopediaAdmin@0000%",
      12,
    );
    const existingAdminByEmail = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [adminEmail],
    );
    const existingAdminById = await client.query(
      "SELECT id FROM users WHERE id = $1 LIMIT 1",
      ["admin-001"],
    );
    const adminId =
      existingAdminByEmail.rows[0]?.id ||
      existingAdminById.rows[0]?.id ||
      "admin-001";
    await client.query(
      `INSERT INTO users (id, full_name, email, password_hash, phone_number, profile_image, role, roles, company_id, account_status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash,
       role = 'admin', roles = EXCLUDED.roles, account_status = 'active', email_verified = TRUE, updated_at = NOW()`,
      [
        adminId,
        "System Administrator",
        adminEmail,
        adminPasswordHash,
        null,
        null,
        "admin",
        JSON.stringify(["admin"]),
        null,
        "active",
        true,
      ],
    );
  } finally {
    client.release();
  }
}

module.exports = { getDb, initDb, saveDb };
