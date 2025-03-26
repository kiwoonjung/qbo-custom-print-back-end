import fetch from "node-fetch";
import { pool } from "./db"; // Assuming you have a PostgreSQL connection pool setup with Supabase

// Exchange authorization code for access token
exports.exchangeCodeForToken = async (req, res) => {
  const { code, redirectUri } = req.body;

  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to exchange token");
    }

    const tokenData = await response.json();

    // Store tokens in Supabase
    const { access_token, refresh_token, realmId } = tokenData;
    await pool.query(
      "INSERT INTO tokens (access_token, refresh_token, realm_id) VALUES ($1, $2, $3)",
      [access_token, refresh_token, realmId]
    );

    res.json({
      access_token,
      refresh_token,
      realmId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refresh access token
exports.refreshAccessToken = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tokens ORDER BY created_at DESC LIMIT 1"
    );

    if (rows.length === 0 || !rows[0].refresh_token) {
      return res.status(401).json({ error: "No refresh token available" });
    }

    const refreshToken = rows[0].refresh_token;
    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const newTokenData = await response.json();
    await pool.query(
      "UPDATE tokens SET access_token = $1, expires_in = $2 WHERE realm_id = $3",
      [newTokenData.access_token, newTokenData.expires_in, rows[0].realm_id]
    );

    res.json({ access_token: newTokenData.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Serve stored token to non-admin users
exports.getAccessToken = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tokens ORDER BY created_at DESC LIMIT 1"
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Access token unavailable" });
    }

    res.json({
      access_token: rows[0].access_token,
      realmId: rows[0].realm_id,
    });
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    res.status(500).json({ error: "Failed to fetch access token" });
  }
};
