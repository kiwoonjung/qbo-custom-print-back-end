import express from "express";
import {
  getClientId,
  exchangeCodeForToken,
  getAccessToken,
} from "../controllers/auth.js";

const router = express.Router();

/* READ */
router.get("/get-client-id", getClientId); // Endpoint to get client ID
router.get("/get-access-token", getAccessToken); // New route for getting access token!
/* POST */
router.post("/exchange-code", exchangeCodeForToken); // Endpoint to exchange authorization code for tokens

export default router;
