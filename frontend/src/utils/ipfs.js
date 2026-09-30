const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const GATEWAY =
  process.env.REACT_APP_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

/**
 * Uploads a file (PDF) to IPFS via Backend API, with client fallback if direct JWT is configured.
 */
export async function uploadToIPFS(file) {
  // 1. Try server-side upload first (recommended for production security)
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload-to-ipfs`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ipfsHash) {
        return data.ipfsHash;
      }
    }
  } catch (backendError) {
    console.warn("Backend IPFS upload unavailable, checking direct JWT fallback:", backendError.message);
  }

  // 2. Fallback to client-side upload if direct JWT is configured in .env
  if (PINATA_JWT) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Direct IPFS upload failed: ${err}`);
    }

    const data = await res.json();
    return data.IpfsHash;
  }

  throw new Error(
    "IPFS Upload Failed: Backend server is not running on " +
      API_URL +
      " and REACT_APP_PINATA_JWT is not set in frontend/.env"
  );
}

/**
 * Uploads JSON metadata for NFTs to IPFS.
 */
export async function uploadJSONToIPFS(jsonObject, fileName = "metadata.json") {
  // 1. Try server-side upload first
  try {
    const res = await fetch(`${API_URL}/upload-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: jsonObject, fileName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ipfsHash) {
        return `ipfs://${data.ipfsHash}`;
      }
    }
  } catch (backendError) {
    console.warn("Backend IPFS JSON upload unavailable, checking direct JWT fallback:", backendError.message);
  }

  // 2. Fallback to client-side
  if (PINATA_JWT) {
    const body = {
      pinataMetadata: { name: fileName },
      pinataContent: jsonObject,
    };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`IPFS JSON upload failed: ${err}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  }

  throw new Error(
    "IPFS JSON Upload Failed: Backend server not reached and REACT_APP_PINATA_JWT not configured."
  );
}

export function getIPFSUrl(hash) {
  if (!hash) return "";
  const cleanHash = hash.replace("ipfs://", "");
  return `${GATEWAY}/${cleanHash}`;
}