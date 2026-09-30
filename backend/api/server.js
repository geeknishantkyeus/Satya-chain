import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import uploadRouter from "./upload.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Body Parsing
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple in-memory rate limiter (100 requests per minute per IP)
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "global";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 100;

  const current = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  requestCounts.set(ip, current);

  if (current.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded (100 requests/minute). Please slow down.",
    });
  }
  next();
});

// Mount IPFS upload router
app.use("/api", uploadRouter);

// Load constants (Addresses & ABIs) dynamically from constants.js
let contractAddresses = {};
let contractABIs = {};
let provider = null;

async function initBlockchain() {
  try {
    const rpcUrl =
      process.env.POLYGON_AMOY_RPC ||
      process.env.LOCAL_RPC ||
      "https://rpc-amoy.polygon.technology/";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    // 1. Try local constants.json first (self-contained for cloud deployment)
    const localConstantsPath = path.resolve(__dirname, "./constants.json");
    try {
      const raw = await fs.readFile(localConstantsPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.CONTRACT_ADDRESSES) contractAddresses = parsed.CONTRACT_ADDRESSES;
      if (parsed.CONTRACT_ABIS) contractABIs = parsed.CONTRACT_ABIS;
      console.log("🔗 Loaded contracts configuration from local constants.json");
    } catch {
      // 2. Fallback to frontend constants.js
      const frontendPath = path.resolve(__dirname, "../../frontend/src/config/constants.js");
      try {
        const content = await fs.readFile(frontendPath, "utf-8");
        const addrMatch = content.match(/export const CONTRACT_ADDRESSES = (\{[\s\S]*?\});/);
        if (addrMatch) {
          contractAddresses = new Function(`return (${addrMatch[1]})`)();
        }
        const abiMatch = content.match(/export const CONTRACT_ABIS = (\{[\s\S]*?\});/);
        if (abiMatch) {
          contractABIs = new Function(`return (${abiMatch[1]})`)();
        }
        console.log("🔗 Loaded contracts configuration from frontend constants.js");
      } catch (feErr) {
        console.warn("⚠️ Could not load frontend constants.js:", feErr.message);
      }
    }

    console.log("🔗 Blockchain provider initialized with RPC:", rpcUrl);
  } catch (err) {
    console.warn("⚠️ Blockchain initialization warning:", err.message);
  }
}

initBlockchain();

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Satya-Chain Trust Layer Backend API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/verify/:sector/:id
app.get("/api/verify/:sector/:id", async (req, res) => {
  try {
    const { sector, id } = req.params;
    if (!contractAddresses[sector] || !contractABIs[sector]) {
      return res.status(400).json({
        success: false,
        error: `Unknown or unconfigured sector: ${sector}`,
      });
    }

    if (!provider) {
      return res.status(500).json({
        success: false,
        error: "Blockchain provider is not ready",
      });
    }

    const contract = new ethers.Contract(
      contractAddresses[sector],
      contractABIs[sector],
      provider
    );

    const result = await contract.verify(id);
    let record = {};

    if (sector === "education") {
      record = {
        id,
        studentName: result[0],
        course: result[1],
        ipfsHash: result[2],
        issueDate: new Date(Number(result[3]) * 1000).toISOString(),
        isValid: result[4],
      };
    } else if (sector === "government") {
      record = {
        id,
        holderName: result[0],
        idType: result[1],
        ipfsHash: result[2],
        issueDate: new Date(Number(result[3]) * 1000).toISOString(),
        isValid: result[4],
      };
    } else if (sector === "healthcare") {
      record = {
        id,
        patientName: result[0],
        recordType: result[1],
        doctorName: result[2],
        ipfsHash: result[3],
        issueDate: new Date(Number(result[4]) * 1000).toISOString(),
        isValid: result[5],
      };
    } else if (sector === "land") {
      record = {
        id,
        ownerName: result[0],
        deedType: result[1],
        propertyAddress: result[2],
        ipfsHash: result[3],
        issueDate: new Date(Number(result[4]) * 1000).toISOString(),
        isValid: result[5],
      };
    }

    return res.json({ success: true, sector, record });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Verification query failed",
    });
  }
});

// GET /api/records/:sector/:wallet
app.get("/api/records/:sector/:wallet", async (req, res) => {
  try {
    const { sector, wallet } = req.params;
    if (!contractAddresses[sector] || !contractABIs[sector]) {
      return res.status(400).json({
        success: false,
        error: `Unknown sector: ${sector}`,
      });
    }

    const contract = new ethers.Contract(
      contractAddresses[sector],
      contractABIs[sector],
      provider
    );

    let ids = [];
    if (sector === "education") {
      ids = await contract.getCertificatesByStudent(wallet);
    } else {
      ids = await contract.getRecordsByWallet(wallet.toLowerCase());
    }

    return res.json({ success: true, sector, wallet, ids });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Record lookup failed",
    });
  }
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Satya-Chain Backend API running on http://localhost:${PORT}`);
  });
}

export default app;
