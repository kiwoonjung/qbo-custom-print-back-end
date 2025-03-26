import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Establish connection to the database using Supabase URL (no SSL)
const sql = postgres({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // Optional: Enable SSL for production
});

// Function to create the table if it doesn't exist
const createTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        realm_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

  try {
    // Execute the query to create the table
    await sql.unsafe(query);
    console.log("✅ Tokens table is ready in Supabase!");
  } catch (error) {
    console.error("❌ Error creating tokens table:", error);
  }
};

// Run table creation when server starts
createTable();

// Export the SQL client for use in other parts of your app
export default sql;
