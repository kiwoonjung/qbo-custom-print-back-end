import axios from "axios";
import "dotenv/config";
import { URLSearchParams } from "url"; // Node.js built-in module for URLSearchParams
import fs from "fs"; // To store tokens locally (e.g., for persistent storage)

// Function to save tokens (use a persistent store for production)
const saveTokens = (accessToken, refreshToken, realmId) => {
  const tokenData = { accessToken, refreshToken, realmId };
  fs.writeFileSync("tokens.json", JSON.stringify(tokenData)); // Save tokens to a file (or use a DB in production)
};

// Function to load tokens (if saved previously)
const loadTokens = () => {
  try {
    const data = fs.readFileSync("tokens.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};

export const getClientId = async (req, res) => {
  try {
    if (!process.env.CLIENT_ID) {
      throw new Error("CLIENT_ID is not defined in environment variables");
    }
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

  // Try loading the stored token data (if any)
  const savedTokens = loadTokens();

  if (savedTokens && savedTokens.accessToken) {
    // If the access token is available, return it
    return res.json({
      access_token: savedTokens.accessToken,
      refresh_token: savedTokens.refreshToken,
      realmId: savedTokens.realmId,
    });
  }

  try {
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

    // Save the tokens for future use
    saveTokens(
      response.data.access_token,
      response.data.refresh_token,
      response.data.realmId
    );

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      realmId: response.data.realmId,
    });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
};

// Token refresh logic (use this when the access token is expired)
export const refreshToken = async (req, res) => {
  const savedTokens = loadTokens();

  if (!savedTokens || !savedTokens.refreshToken) {
    return res.status(400).json({ error: "No refresh token found" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", savedTokens.refreshToken);

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

    // Save the new access token and refresh token
    saveTokens(
      response.data.access_token,
      response.data.refresh_token,
      savedTokens.realmId
    );

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    });
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
