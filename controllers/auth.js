import axios from "axios";
import "dotenv/config";
import { URLSearchParams } from "url"; // Node.js built-in module for URLSearchParams
import fs from "fs"; // To store tokens locally (for simplicity, in production use DB)

// Function to save admin tokens (in a secure place in production, like a DB)
const saveAdminTokens = (accessToken, refreshToken) => {
  const tokenData = { accessToken, refreshToken, realmId: "9341453571717976" }; // Fixed realmId
  fs.writeFileSync("admin_tokens.json", JSON.stringify(tokenData)); // Save tokens to a file
};

// Function to load admin tokens
const loadAdminTokens = () => {
  try {
    const data = fs.readFileSync("admin_tokens.json", "utf8");
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

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

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

    // Save the admin's tokens for future use (with fixed realmId)
    saveAdminTokens(response.data.access_token, response.data.refresh_token);

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      realmId: "9341453571717976", // Fixed realmId
    });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
};

// Using Admin Token for Non-Admin Users
export const getAdminTokenForUser = async (req, res) => {
  try {
    const adminTokens = loadAdminTokens();

    if (!adminTokens || !adminTokens.accessToken) {
      return res.status(400).json({ error: "Admin token not found" });
    }

    // Use the admin token for API calls on behalf of the non-admin user
    const response = await axios.get(
      `https://quickbooks.api.intuit.com/v3/company/9341453571717976/some-endpoint`, // Fixed realmId
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data with admin token:", error.message);
    res.status(500).json({ error: "Failed to fetch data with admin token" });
  }
};

// Refresh the admin token if expired
export const refreshAdminToken = async (req, res) => {
  const adminTokens = loadAdminTokens();

  if (!adminTokens || !adminTokens.refreshToken) {
    return res.status(400).json({ error: "No refresh token found for admin" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", adminTokens.refreshToken);

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

    // Save the refreshed tokens with fixed realmId
    saveAdminTokens(response.data.access_token, response.data.refresh_token);

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    });
  } catch (error) {
    console.error("Error refreshing admin token:", error.message);
    res.status(500).json({ error: "Failed to refresh admin token" });
  }
};
