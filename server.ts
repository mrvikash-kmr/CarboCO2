import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { scanRoutes } from "./src/server/routes/scanRoutes.js";

async function startServer() {
  const app = express();
  const PORT: number = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", scanRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`\n📝 Important: Add 'localhost' and '127.0.0.1' to Firebase Authorized Domains`);
    console.log(`   Firebase Console → Authentication → Settings → Authorized Domains\n`);
  });
}

startServer();
