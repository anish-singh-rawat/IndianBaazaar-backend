import { createServer } from "./index-server";
import dotenv from "dotenv";

dotenv.config();

const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Indian Baazaar Backend Server running on port ${port}`);
  console.log(`🔧 API Base URL: http://localhost:${port}/api`);
  console.log(`📊 Health Check: http://localhost:${port}/api/health`);
});

// Add a basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "Indian Baazaar Backend"
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
