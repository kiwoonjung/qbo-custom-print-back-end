import express from "express";
import { getClientId, exchangeCodeForToken } from "../controllers/auth.js";

const router = express.Router();

/* GET - Fetch Client ID */
router.get("/get-client-id", getClientId); // Now calling the getClientId function from the controller

/* POST - Exchange Authorization Code for Token */
router.post("/exchange-code", exchangeCodeForToken); // This will handle the OAuth token exchange

export default router;
