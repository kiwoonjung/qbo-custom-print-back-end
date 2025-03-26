import cors from "cors";
import "dotenv/config";

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || "*", // Allow all origins by default
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
