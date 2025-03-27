import sql from "../config/db.js"; // Import sql client from db.js
import dotenv from "dotenv";

dotenv.config();

// Get Client ID (from environment variables or config)
export const getClientId = (req, res) => {
  try {
    const clientId = process.env.QBO_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "Client ID not configured!" });
    }
    res.json({ clientId });
  } catch (error) {
    console.error("Error fetching client ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Exchange code for access token and store it in the database
export const exchangeCodeForToken = async (req, res) => {
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
    console.log("✅ Token Data:", tokenData);

    // Use default realmId if missing
    const realmId = tokenData.realmId || "9341453571717976";

    console.log("📢 Storing in database: ", {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      realmId,
    });

    // Store tokens in the database
    await sql`
      INSERT INTO tokens (access_token, refresh_token, realm_id)
      VALUES (${tokenData.access_token}, ${tokenData.refresh_token}, ${realmId})
    `;

    res.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      realmId,
    });
  } catch (error) {
    console.error("🔥 Error during token exchange:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get access token from the database (or generate a new one if not available)
export const getAccessToken = async (req, res) => {
  try {
    // Retrieve the access token from your database
    const result = await sql`
      SELECT access_token FROM tokens
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "No access token found." });
    }

    const accessToken = result[0].access_token;
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).json({ error: error.message });
  }
};
