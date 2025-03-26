import postgres from "postgres";

dotenv.config();

const { Pool } = postgres;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Supabase URL from env variables
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

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
    await pool.query(query);
    console.log("✅ Tokens table is ready in Supabase!");
  } catch (error) {
    console.error("❌ Error creating tokens table:", error);
  }
};

// Run table creation when server starts
createTable();

export default pool;

// import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // Use Supabase URL from env variables
//   ssl: {
//     rejectUnauthorized: false, // Required for Supabase
//   },
//   host: "db.rmcukybxmacfbisyzfoj.supabase.co", // Explicitly set host
//   dnsFamily: 4,
// });

// const createTable = async () => {
//   const query = `
//       CREATE TABLE IF NOT EXISTS tokens (
//         id SERIAL PRIMARY KEY,
//         access_token TEXT NOT NULL,
//         refresh_token TEXT NOT NULL,
//         realm_id TEXT NOT NULL UNIQUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;

//   try {
//     await pool.query(query);
//     console.log("✅ Tokens table is ready in Supabase!");
//   } catch (error) {
//     console.error("❌ Error creating tokens table:", error);
//   }
// };

// // Run table creation when server starts
// createTable();

// export default pool;
