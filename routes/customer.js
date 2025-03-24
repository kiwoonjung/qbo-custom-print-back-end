import express from "express";
import { getCustomer } from "../controllers/customers";

const router = express.Router();

/* READ */
router.get("/", getCustomer);

export default router;
