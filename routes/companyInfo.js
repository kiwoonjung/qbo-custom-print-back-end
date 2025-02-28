import express from "express";
import { getCompanyInfo } from "../controllers/companyInfo.js";

const router = express.Router();

/* READ */
router.post("/", getCompanyInfo);

export default router;
