import axios from "axios";
import "dotenv/config";
import { URLSearchParams } from "url"; // Node.js built-in module for URLSearchParams
import fs from "fs"; // File system module to store tokens (replace with DB in production)

// Token storage file (replace with database if needed)
const TOKEN_STORAGE_FILE = "./tokens.json";

// Function to read stored tokens
const getStoredTokens = () => {
  if (fs.existsSync(TOKEN_STORAGE_FILE)) {
    const data = fs.readFileSync(TOKEN_STORAGE_FILE, "utf-8");
    return JSON.parse(data);
  }
  return null;
};

// Function to store tokens
const storeTokens = (tokens) => {
  fs.writeFileSync(TOKEN_STORAGE_FILE, JSON.stringify(tokens, null, 2));
};

/* READ */
export const getClientId = async (req, res) => {
  try {
    if (!process.env.CLIENT_ID) {
      throw new Error("CLIENT_ID is not defined in environment variables");
    }
    console.log("Received request for clientId");
    res.json({ clientId: process.env.CLIENT_ID });
  } catch (error) {
    console.error("Error in getClientId:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch clientId", details: error.message });
  }
};

export const exchangeCode = async (req, res) => {
  const { code, redirectUri } = req.body;

  try {
    // Check if an admin token already exists
    const storedTokens = getStoredTokens();
    if (storedTokens && storedTokens.access_token) {
      console.log("Using stored admin access token.");
      return res.json(storedTokens);
    }

    // Proceed with OAuth flow if no token is stored
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append(
      "scope",
      "com.intuit.quickbooks.accounting openid profile email"
    );

    const response = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    // Store tokens for future use
    const tokenData = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      realmId: response.data.realmId || "9341453571717976",
    };
    storeTokens(tokenData);

    res.json(tokenData);
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
};
