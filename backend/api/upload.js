import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

/**
 * POST /api/upload-to-ipfs
 * Server-side upload to Pinata IPFS (keeps Pinata JWT secure on server)
 */
router.post("/upload-to-ipfs", upload.single("file"), async (req, res) => {
  try {
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return res.status(500).json({
        success: false,
        error: "PINATA_JWT is not configured in backend/.env",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided in form-data ('file' key expected)",
      });
    }

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append("file", blob, req.file.originalname || "document.pdf");

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: formData,
      }
    );

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      return res.status(pinataRes.status).json({
        success: false,
        error: `Pinata API error: ${errText}`,
      });
    }

    const data = await pinataRes.json();
    return res.status(200).json({
      success: true,
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
      ipfsUri: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });
  } catch (error) {
    console.error("[Upload API Error]:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    });
  }
});

/**
 * POST /api/upload-json
 * Server-side upload of NFT metadata JSON to Pinata
 */
router.post("/upload-json", async (req, res) => {
  try {
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return res.status(500).json({
        success: false,
        error: "PINATA_JWT is not configured in backend/.env",
      });
    }

    const { metadata, fileName = "metadata.json" } = req.body;
    if (!metadata) {
      return res.status(400).json({
        success: false,
        error: "'metadata' object required in request body",
      });
    }

    const body = {
      pinataMetadata: { name: fileName },
      pinataContent: metadata,
    };

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      return res.status(pinataRes.status).json({
        success: false,
        error: `Pinata JSON error: ${errText}`,
      });
    }

    const data = await pinataRes.json();
    return res.status(200).json({
      success: true,
      ipfsHash: data.IpfsHash,
      ipfsUri: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });
  } catch (error) {
    console.error("[Upload JSON Error]:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    });
  }
});

export default router;
