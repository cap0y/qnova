import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";

export async function setupProductionVite(app: Express, server: Server) {
  // Create Vite server that bypasses host restrictions for production deployment
  const vite = await createViteServer({
    configFile: false,
    mode: "development",
    server: {
      middlewareMode: true,
      hmr: false,
      host: "0.0.0.0",
      origin: `http://localhost:${process.env.PORT || "5000"}`,
      allowedHosts: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
    root: path.resolve(process.cwd(), "client"),
    appType: "custom",
    logLevel: "warn",
    define: {
      // Override host checks and ensure development mode for proper HMR bypass
      'process.env.NODE_ENV': '"development"',
      global: 'globalThis',
    },
  });

  app.use(vite.middlewares);
  
  // Serve the main HTML file for all non-API routes
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Skip API routes
      if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
        return next();
      }

      const template = await fs.promises.readFile(
        path.resolve(process.cwd(), "client", "index.html"),
        "utf-8"
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.error("Error serving HTML:", e);
      next(e);
    }
  });

  return vite;
}