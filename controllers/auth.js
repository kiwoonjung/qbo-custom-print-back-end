import axios from "axios";
import "dotenv/config";
import { URLSearchParams } from "url"; // Node.js built-in module for URLSearchParams

/* READ */
export const getClientId = async (req, res) => {
  try {
    // Check if CLIENT_ID is defined
    if (!process.env.CLIENT_ID) {
      throw new Error("CLIENT_ID is not defined in environment variables");
    }

    // Log the request (optional, for debugging)
    console.log("Received request for clientId");

    // Send the clientId in the response
    res.json({ clientId: process.env.CLIENT_ID });
  } catch (error) {
    // Log the error
    console.error("Error in getClientId:", error.message);

    // Send an error response
    res
      .status(500)
      .json({ error: "Failed to fetch clientId", details: error.message });
  }
};

export const exchangeCode = async (req, res) => {
  //   console.log("exchangecode", req.body);
  //   console.log("data", process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  const { code, redirectUri } = req.body;

  try {
    // Create URL-encoded request body
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    // Make the request to Intuit OAuth API
    const response = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      params.toString(), // Send as URL-encoded string
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    // console.log("response", response.data);

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      realmId: response.data.realmId || "9341453571717976", // Fallback realmId
    });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
};
