import express from "express";
import "dotenv/config";
import invoiceRoutes from "./routes/invoice.js";
import companyRoutes from "./routes/companyInfo.js";
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/companyInfo.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
import cors from "cors"; // Corrected import from the cors package

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "chrome-extension://bkcjiigjjabcnlkcnjkbdeacehmcpbdn",
      "chrome-extension://jdpebblpkmmcgldefddicgblgkggkpid",
      "chrome-extension://eapnjnmhidniehmnaikajfomkofnibap",
      "chrome-extension://aicefnigcnpffooiiipdnopmjbidmoah",
      // Your specific extension origin
      "*", // Allow all origins, use carefully in production
    ],
  })
);

app.use(logger); // Logging middleware
app.use(express.json()); // Parse JSON request bodies

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

// ROUTES
app.use("/auth", authRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/companyInfo", companyRoutes);
app.use("/customer", customerRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
