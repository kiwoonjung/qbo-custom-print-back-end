import express from "express";
import cors from "cors";
import invoiceRoutes from "./routes/invoice.js";
import companyRoutes from "./routes/companyInfo.js";

// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");

const app = express();

// Enable CORS for testing (optional)
app.use(cors());

/* ROUTES */
app.use("/invoice", invoiceRoutes);
app.use("/companyInfo", companyRoutes);

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
