import express from "express";
import { getClientId, exchangeCode } from "../controllers/auth.js";
// import auth from "./middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/get-client-id", getClientId);

/* POST*/
router.post("/exchange-code", exchangeCode);

export default router;
