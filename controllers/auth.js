import axios from "axios";
import "dotenv/config";
import { URLSearchParams } from "url"; // Node.js built-in module

const QBO_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const QBO_TOKEN_URL =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QBO_API_URL = "https://quickbooks.api.intuit.com/v3/company";

/* Get Client ID */
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

/* Generate QBO Login URL */
export const getAuthUrl = async (req, res) => {
  try {
    const { redirectUri } = req.query; // Get redirect URI from frontend
    const scopes = [
      "com.intuit.quickbooks.accounting",
      "openid",
      "profile",
      "email",
    ].join(" ");

    const authUrl = `${QBO_AUTH_URL}?client_id=${
      process.env.CLIENT_ID
    }&response_type=code&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=randomString`;

    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error.message);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
};

/* Exchange Code for Access Token */
export const exchangeCode = async (req, res) => {
  const { code, redirectUri } = req.body;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    const response = await axios.post(QBO_TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token, refresh_token, realmId } = response.data;

    // Fetch user role after authentication
    const userRole = await checkUserRole(access_token, realmId);

    res.json({
      access_token,
      refresh_token,
      realmId,
      userRole,
    });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
};

/* Fetch User Role */
const checkUserRole = async (accessToken, realmId) => {
  try {
    const response = await axios.get(
      `${QBO_API_URL}/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user role:",
      error.response?.data || error.message
    );
    return null;
  }
};
