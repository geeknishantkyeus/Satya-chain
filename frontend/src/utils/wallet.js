import { ethers } from "ethers";
import { NETWORK } from "../config/constants";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask install karo!");
  }

  // ⭐ Force MetaMask popup har baar
  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (err) {
    if (err.code === 4001) {
      throw new Error("Connection rejected by user");
    }
    console.warn("wallet_requestPermissions not available:", err.message);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  // Network check — switch to configured network if not already on it
  const expectedChainId = BigInt(NETWORK.chainId).toString();
  if (network.chainId.toString() !== expectedChainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address, provider };
}

export async function getCurrentAccount() {
  if (!window.ethereum) return null;
  try {
    // ⭐ Check karo ki user ne manually disconnect kiya hai
    const manuallyDisconnected = localStorage.getItem("wallet_disconnected");
    if (manuallyDisconnected === "true") return null;

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function disconnectWallet() {
  try {
    // ⭐ MetaMask se permissions revoke karo (agar supported hai)
    if (window.ethereum && window.ethereum.request) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.warn("wallet_revokePermissions not supported:", err.message);
      }
    }

    // ⭐ Frontend flag set karo
    localStorage.setItem("wallet_disconnected", "true");

    return true;
  } catch (error) {
    console.error("Disconnect error:", error);
    return false;
  }
}