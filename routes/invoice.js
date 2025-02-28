import express from "express";
import { getInvoice } from "../controllers/invoices.js";

const router = express.Router();

/* READ */
router.get("/", getInvoice);

export default router;
