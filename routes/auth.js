import express from "express";
import { getClientId, exchangeCode } from "../controllers/auth.js"; // Import controller functions

const router = express.Router();

/* READ */
router.get("/get-client-id", getClientId); // Endpoint to get client ID

/* POST */
router.post("/exchange-code", exchangeCode); // Endpoint to exchange authorization code for tokens

export default router;
