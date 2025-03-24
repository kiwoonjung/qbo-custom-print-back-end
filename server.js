import express from "express";
import "dotenv/config";
import invoiceRoutes from "./routes/invoice.js";
import companyRoutes from "./routes/companyInfo.js";
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/companyInfo.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
// import auth from "./middleware/auth.js";
import cors from "./middleware/cors.js";

const app = express();

// Middleware
app.use(cors); // CORS middleware
app.use(logger); // Logging middleware
app.use(express.json()); // Parse JSON request bodies

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/companyInfo", companyRoutes);
app.use("/customer", customerRoutes);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
