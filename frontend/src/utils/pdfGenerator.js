import jsPDF from "jspdf";
import QRCode from "qrcode";

// ============================================
// COMMON HELPERS
// ============================================

async function generateQR(verifyURL) {
  return await QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 1,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
}

function drawTrackedText(doc, text, x, y, tracking = 1, options = {}) {
  const {
    align = "left",
    fontSize = 10,
    font = "helvetica",
    style = "normal",
    color,
  } = options;

  doc.setFontSize(fontSize);
  doc.setFont(font, style);
  if (color) doc.setTextColor(...color);

  if (align === "center") {
    const textWidth = doc.getTextWidth(text);
    const totalWidth = textWidth + (text.length - 1) * tracking;
    let currentX = x - totalWidth / 2;

    for (let i = 0; i < text.length; i++) {
      doc.text(text[i], currentX, y);
      currentX += doc.getTextWidth(text[i]) + tracking;
    }
  } else {
    let currentX = x;
    for (let i = 0; i < text.length; i++) {
      doc.text(text[i], currentX, y);
      currentX += doc.getTextWidth(text[i]) + tracking;
    }
  }
}

// ============================================
// 1. EDUCATION PDF — Elegant Certificate
// ============================================

export async function generateEducationPDF(data) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const cx = W / 2;

  const colors = {
    indigo: [79, 70, 229],
    indigoLight: [129, 140, 248],
    cyan: [6, 182, 212],
    slate900: [15, 23, 42],
    slate500: [100, 116, 139],
    slate300: [203, 213, 225],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
  };

  // Background
  doc.setFillColor(...colors.slate50);
  doc.rect(0, 0, W, H, "F");

  // Outer indigo border
  doc.setDrawColor(...colors.indigo);
  doc.setLineWidth(2.5);
  doc.rect(15, 15, W - 30, H - 30);

  // Inner cyan border
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.4);
  doc.rect(19, 19, W - 38, H - 38);

  // Corner ornaments
  doc.setFillColor(...colors.indigo);
  doc.rect(8, 8, 25, 1.5, "F");
  doc.rect(8, 8, 1.5, 25, "F");
  doc.rect(W - 33, 8, 25, 1.5, "F");
  doc.rect(W - 9.5, 8, 1.5, 25, "F");
  doc.rect(8, H - 9.5, 25, 1.5, "F");
  doc.rect(8, H - 33, 1.5, 25, "F");
  doc.rect(W - 33, H - 9.5, 25, 1.5, "F");
  doc.rect(W - 9.5, H - 33, 1.5, 25, "F");

  // Small badge
  drawTrackedText(doc, "OFFICIAL CERTIFICATE", cx, 30, 3, {
    align: "center",
    fontSize: 7,
    style: "bold",
    color: colors.indigo,
  });
  doc.setFillColor(...colors.cyan);
  doc.circle(cx - 40, 29, 0.8, "F");
  doc.circle(cx + 40, 29, 0.8, "F");

  // Main title
  drawTrackedText(doc, "CERTIFICATE", cx, 46, 6, {
    align: "center",
    fontSize: 32,
    font: "times",
    style: "bold",
    color: colors.slate900,
  });

  drawTrackedText(doc, "OF COMPLETION", cx, 55, 4, {
    align: "center",
    fontSize: 9,
    color: colors.slate500,
  });

  // Divider
  doc.setDrawColor(...colors.slate300);
  doc.setLineWidth(0.3);
  doc.line(cx - 40, 60, cx - 5, 60);
  doc.line(cx + 5, 60, cx + 40, 60);
  doc.setFillColor(...colors.indigo);
  doc.circle(cx, 60, 1.2, "F");

  // University
  drawTrackedText(doc, (data.university || "MUMBAI UNIVERSITY").toUpperCase(), cx, 72, 2, {
    align: "center",
    fontSize: 11,
    style: "bold",
    color: colors.indigo,
  });

  const uniWidth = doc.getTextWidth((data.university || "MUMBAI UNIVERSITY").toUpperCase()) + 12;
  doc.setDrawColor(...colors.cyan);
  doc.line(cx - uniWidth / 2, 75, cx + uniWidth / 2, 75);

  // "This is to certify"
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate500);
  doc.text("This is to certify that", cx, 88, { align: "center" });

  // Student name
  doc.setFont("times", "bolditalic");
  doc.setFontSize(38);
  doc.setTextColor(...colors.slate900);
  doc.text(data.studentName || "Student Name", cx, 108, { align: "center" });

  const nameWidth = doc.getTextWidth(data.studentName || "Student Name");
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.6);
  doc.line(cx - nameWidth / 2 - 8, 113, cx - nameWidth / 2 - 3, 113);
  doc.line(cx + nameWidth / 2 + 3, 113, cx + nameWidth / 2 + 8, 113);
  doc.setFillColor(...colors.cyan);
  doc.circle(cx, 113, 1, "F");

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate500);
  doc.text("has successfully completed the course", cx, 125, { align: "center" });

  drawTrackedText(doc, (data.course || "B.Tech").toUpperCase(), cx, 140, 1.5, {
    align: "center",
    fontSize: 16,
    style: "bold",
    color: [55, 48, 163],
  });

  // Issue date + cert ID boxes
  const issueDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Left box
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate300);
  doc.roundedRect(25, 158, 60, 20, 2, 2, "FD");
  doc.setFillColor(...colors.indigo);
  doc.rect(25, 158, 60, 0.8, "F");
  drawTrackedText(doc, "ISSUE DATE", 55, 165, 1.2, {
    align: "center",
    fontSize: 7,
    style: "bold",
    color: colors.slate500,
  });
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(issueDate, 55, 174, { align: "center" });

  // Right box
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate300);
  doc.roundedRect(90, 158, 60, 20, 2, 2, "FD");
  doc.setFillColor(...colors.cyan);
  doc.rect(90, 158, 60, 0.8, "F");
  drawTrackedText(doc, "CERTIFICATE ID", 120, 165, 1.2, {
    align: "center",
    fontSize: 7,
    style: "bold",
    color: colors.slate500,
  });
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(data.certId || "CERT-001", 120, 174, { align: "center" });

  // Signature
  doc.setDrawColor(...colors.slate500);
  doc.setLineWidth(0.4);
  doc.line(165, 172, 210, 172);
  drawTrackedText(doc, "AUTHORIZED SIGNATURE", 187.5, 178, 1, {
    align: "center",
    fontSize: 6.5,
    color: colors.slate500,
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...colors.indigo);
  doc.text("Registrar", 187.5, 183, { align: "center" });

  // QR
  const verifyURL = `${window.location.origin}/verify/${data.certId}?sector=education`;
  const qrDataURL = await generateQR(verifyURL);
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.indigo);
  doc.setLineWidth(0.4);
  doc.roundedRect(225, 155, 48, 48, 2, 2, "FD");
  doc.addImage(qrDataURL, "PNG", 228, 158, 42, 42);
  drawTrackedText(doc, "SCAN TO VERIFY", 249, 208, 1.2, {
    align: "center",
    fontSize: 6,
    style: "bold",
    color: colors.indigo,
  });

  // Watermark
  doc.setTextColor(238, 242, 250);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("SATYA-CHAIN • VERIFIED ON BLOCKCHAIN", cx, 115, {
    align: "center",
    angle: 30,
  });

  // Blockchain trust layer footer & Explorer link
  doc.setFontSize(6);
  doc.setTextColor(...colors.slate500);
  doc.text(
    `🔒 Satya-Chain Trust Layer • IPFS Immutable • PolygonScan: https://amoy.polygonscan.com`,
    cx,
    203,
    { align: "center" }
  );

  return doc.output("blob");
}

// ============================================
// 2. GOVERNMENT ID PDF — ID Card Style
// ============================================

export async function generateGovernmentPDF(data) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const cx = W / 2;

  const colors = {
    navy: [15, 23, 42],
    cyan: [6, 182, 212],
    cyanDeep: [8, 145, 178],
    slate900: [15, 23, 42],
    slate600: [71, 85, 105],
    slate400: [148, 163, 184],
    slate100: [241, 245, 249],
    white: [255, 255, 255],
    emerald: [16, 185, 129],
  };

  // Background
  doc.setFillColor(...colors.slate100);
  doc.rect(0, 0, W, H, "F");

  // Main card (centered)
  const cardW = 200;
  const cardH = 130;
  const cardX = (W - cardW) / 2;
  const cardY = (H - cardH) / 2;

  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.navy);
  doc.setLineWidth(0.5);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "FD");

  // Header band
  doc.setFillColor(...colors.navy);
  doc.roundedRect(cardX, cardY, cardW, 22, 4, 4, "F");
  doc.rect(cardX, cardY + 18, cardW, 4, "F");

  // Cyan accent line
  doc.setFillColor(...colors.cyan);
  doc.rect(cardX, cardY + 22, cardW, 1.5, "F");

  // Header text
  drawTrackedText(doc, "GOVERNMENT OF INDIA", cx, cardY + 10, 3, {
    align: "center",
    fontSize: 10,
    style: "bold",
    color: colors.white,
  });
  drawTrackedText(doc, "OFFICIAL IDENTITY DOCUMENT", cx, cardY + 17, 2, {
    align: "center",
    fontSize: 7,
    color: [203, 213, 225],
  });

  // Photo placeholder (left)
  doc.setFillColor(...colors.slate100);
  doc.setDrawColor(...colors.slate400);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX + 10, cardY + 30, 40, 50, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...colors.slate400);
  doc.text("PHOTO", cardX + 30, cardY + 58, { align: "center" });

  // ID Type
  doc.setFillColor(...colors.cyan);
  doc.roundedRect(cardX + 58, cardY + 30, 55, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.white);
  doc.text((data.idType || "AADHAAR").toUpperCase(), cardX + 85.5, cardY + 35.5, { align: "center" });

  // Holder name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.slate400);
  doc.text("HOLDER NAME", cardX + 58, cardY + 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.slate900);
  doc.text(data.studentName || "Holder Name", cardX + 58, cardY + 56);

  // ID Number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.slate400);
  doc.text("ID NUMBER", cardX + 58, cardY + 68);

  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.navy);
  doc.text(data.certId || "0000-0000-0000", cardX + 58, cardY + 76);

  // DOB + Issue date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.slate400);
  doc.text("ISSUE DATE", cardX + 58, cardY + 88);

  const issueDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...colors.slate900);
  doc.text(issueDate, cardX + 58, cardY + 95);

  // QR Code (right)
  const verifyURL = `${window.location.origin}/verify/${data.certId}?sector=government`;
  const qrDataURL = await QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.navy);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX + cardW - 65, cardY + 35, 55, 55, 2, 2, "FD");
  doc.addImage(qrDataURL, "PNG", cardX + cardW - 62, cardY + 38, 49, 49);

  drawTrackedText(doc, "SCAN TO VERIFY", cardX + cardW - 37.5, cardY + 96, 1, {
    align: "center",
    fontSize: 6,
    style: "bold",
    color: colors.navy,
  });

  // Footer band
  doc.setFillColor(...colors.emerald);
  doc.rect(cardX, cardY + cardH - 12, cardW, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...colors.white);
  doc.text("✓ DIGITALLY VERIFIED ON BLOCKCHAIN", cx, cardY + cardH - 5, {
    align: "center",
  });

  // Outer note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate600);
  doc.text(
    "This is a blockchain-verified identity document. Verify authenticity by scanning the QR code.",
    cx,
    cardY + cardH + 15,
    { align: "center", maxWidth: 200 }
  );

  // Watermark
  doc.setTextColor(248, 250, 252);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  doc.text("GOVT ID", cx, H - 30, { align: "center" });

  return doc.output("blob");
}

// ============================================
// 3. HEALTHCARE PDF — Medical Record Style
// ============================================

export async function generateHealthcarePDF(data) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;

  const colors = {
    emerald: [16, 185, 129],
    emeraldDeep: [5, 150, 105],
    emeraldLight: [167, 243, 208],
    slate900: [15, 23, 42],
    slate600: [71, 85, 105],
    slate400: [148, 163, 184],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
    rose: [244, 63, 94],
  };

  // Background
  doc.setFillColor(...colors.slate50);
  doc.rect(0, 0, W, H, "F");

  // Sidebar (left green accent)
  doc.setFillColor(...colors.emerald);
  doc.rect(0, 0, 8, H, "F");

  // Header
  doc.setFillColor(...colors.white);
  doc.rect(8, 0, W - 8, 45, "F");

  // Cross/health icon
  doc.setFillColor(...colors.emerald);
  doc.roundedRect(20, 15, 15, 15, 2, 2, "F");
  doc.setFillColor(...colors.white);
  doc.rect(25.5, 18, 4, 9, "F");
  doc.rect(23, 20.5, 9, 4, "F");

  // Hospital name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...colors.slate900);
  doc.text("MEDICAL RECORD", 42, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.slate600);
  doc.text("Blockchain-Verified Healthcare Document", 42, 29);

  doc.setDrawColor(...colors.emeraldLight);
  doc.setLineWidth(0.5);
  doc.line(20, 38, W - 20, 38);

  // ============================================
  // PATIENT INFO SECTION
  // ============================================

  let y = 58;

  // Section title
  doc.setFillColor(...colors.emeraldLight);
  doc.roundedRect(20, y - 5, 60, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.emeraldDeep);
  doc.text("PATIENT INFORMATION", 24, y);

  y += 10;

  // Patient name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("PATIENT NAME", 20, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.slate900);
  doc.text(data.studentName || "Patient Name", 20, y + 7);

  // Record ID (right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("RECORD ID", W - 80, y);

  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.emeraldDeep);
  doc.text(data.certId || "HLT-000", W - 80, y + 7);

  y += 20;

  // Record Type
  doc.setFillColor(...colors.emeraldLight);
  doc.roundedRect(20, y - 5, 60, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.emeraldDeep);
  doc.text("RECORD DETAILS", 24, y);

  y += 10;

  // Two column layout
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("RECORD TYPE", 20, y);
  doc.text("ISSUING DOCTOR / HOSPITAL", 110, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(data.idType || "Prescription", 20, y + 7);
  doc.text(data.doctorName || "Dr. Not Specified", 110, y + 7);

  y += 20;

  // Issue date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("ISSUE DATE", 20, y);

  const issueDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(issueDate, 20, y + 7);

  // ============================================
  // QR CODE SECTION
  // ============================================

  y += 25;

  doc.setFillColor(...colors.emeraldLight);
  doc.roundedRect(20, y - 5, 60, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.emeraldDeep);
  doc.text("BLOCKCHAIN VERIFICATION", 24, y);

  y += 10;

  // QR Code
  const verifyURL = `${window.location.origin}/verify/${data.certId}?sector=healthcare`;
  const qrDataURL = await QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 1,
    color: { dark: "#059669", light: "#ffffff" },
  });

  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.emerald);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, 50, 50, 2, 2, "FD");
  doc.addImage(qrDataURL, "PNG", 23, y + 3, 44, 44);

  // Instructions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...colors.slate900);
  doc.text("Scan QR Code to Verify", 78, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.slate600);
  const instructions = [
    "1. Open any QR scanner on your phone",
    "2. Scan the QR code on this document",
    "3. View real-time verification on blockchain",
    "4. Any tampering will be detected instantly",
  ];
  instructions.forEach((line, i) => {
    doc.text(line, 78, y + 18 + i * 6);
  });

  // ============================================
  // FOOTER
  // ============================================

  y += 65;

  doc.setDrawColor(...colors.emeraldLight);
  doc.setLineWidth(0.5);
  doc.line(20, y, W - 20, y);

  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.emeraldDeep);
  doc.text("✓ DIGITALLY VERIFIED ON BLOCKCHAIN", 20, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.slate400);
  doc.text(
    "This medical record is secured on the blockchain. Any modification will invalidate the record.",
    20,
    y + 6
  );

  // Watermark
  doc.setTextColor(248, 250, 252);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(50);
  doc.text("HEALTHCARE", W / 2, H / 2 + 30, { align: "center", angle: 0 });

  return doc.output("blob");
}

// ============================================
// 4. LAND PDF — Property Deed Style
// ============================================

export async function generateLandPDF(data) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const cx = W / 2;

  const colors = {
    amber: [217, 119, 6],
    amberDeep: [180, 83, 9],
    amberLight: [253, 230, 138],
    brown: [120, 53, 15],
    slate900: [15, 23, 42],
    slate700: [51, 65, 85],
    slate600: [71, 85, 105],
    slate400: [148, 163, 184],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
  };

  // Background
  doc.setFillColor(...colors.slate50);
  doc.rect(0, 0, W, H, "F");

  // Ornate border
  doc.setDrawColor(...colors.amber);
  doc.setLineWidth(2);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(...colors.amber);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, W - 28, H - 28);

  // Corner ornaments
  doc.setFillColor(...colors.amber);
  doc.rect(8, 8, 20, 1.5, "F");
  doc.rect(8, 8, 1.5, 20, "F");
  doc.rect(W - 28, 8, 20, 1.5, "F");
  doc.rect(W - 9.5, 8, 1.5, 20, "F");
  doc.rect(8, H - 9.5, 20, 1.5, "F");
  doc.rect(8, H - 28, 1.5, 20, "F");
  doc.rect(W - 28, H - 9.5, 20, 1.5, "F");
  doc.rect(W - 9.5, H - 28, 1.5, 20, "F");

  // Emblem
  doc.setFillColor(...colors.amber);
  doc.circle(cx, 40, 12, "F");
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("🏛", cx, 46, { align: "center" });

  // Title
  drawTrackedText(doc, "PROPERTY DEED", cx, 68, 4, {
    align: "center",
    fontSize: 20,
    font: "times",
    style: "bold",
    color: colors.brown,
  });

  doc.setDrawColor(...colors.amber);
  doc.setLineWidth(0.6);
  doc.line(60, 73, 150, 73);

  drawTrackedText(doc, "OFFICIAL LAND REGISTRY DOCUMENT", cx, 82, 2, {
    align: "center",
    fontSize: 8,
    color: colors.slate600,
  });

  // ============================================
  // DEED DETAILS
  // ============================================

  let y = 100;

  // Deed ID box
  doc.setFillColor(...colors.amberLight);
  doc.roundedRect(20, y - 5, W - 40, 18, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.brown);
  doc.text("DEED ID", 25, y + 1);

  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.slate900);
  doc.text(data.certId || "LAND-000", 25, y + 9);

  // Deed type (right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.brown);
  doc.text("DEED TYPE", W - 90, y + 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(data.idType || "Property Title", W - 90, y + 9);

  y += 30;

  // Owner section
  doc.setFillColor(...colors.amberLight);
  doc.roundedRect(20, y - 5, 60, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.brown);
  doc.text("OWNER INFORMATION", 24, y);

  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("OWNER NAME", 20, y);

  doc.setFont("times", "bolditalic");
  doc.setFontSize(18);
  doc.setTextColor(...colors.slate900);
  doc.text(data.studentName || "Owner Name", 20, y + 9);

  y += 25;

  // Property section
  doc.setFillColor(...colors.amberLight);
  doc.roundedRect(20, y - 5, 60, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.brown);
  doc.text("PROPERTY DETAILS", 24, y);

  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("PROPERTY ADDRESS", 20, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  const address = data.propertyAddress || "Not specified";
  const addressLines = doc.splitTextToSize(address, W - 40);
  doc.text(addressLines, 20, y + 7);

  y += 15 + addressLines.length * 5;

  // Issue date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate400);
  doc.text("REGISTRATION DATE", 20, y);

  const issueDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(issueDate, 20, y + 7);

  // ============================================
  // QR CODE + SIGNATURE
  // ============================================

  y += 25;

  // QR
  const verifyURL = `${window.location.origin}/verify/${data.certId}?sector=land`;
  const qrDataURL = await QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 1,
    color: { dark: "#b45309", light: "#ffffff" },
  });

  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.amber);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, 45, 45, 2, 2, "FD");
  doc.addImage(qrDataURL, "PNG", 23, y + 3, 39, 39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...colors.amberDeep);
  doc.text("SCAN TO VERIFY", 42.5, y + 50, { align: "center" });

  // Signature block
  doc.setDrawColor(...colors.slate700);
  doc.setLineWidth(0.4);
  doc.line(110, y + 40, 175, y + 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.slate600);
  doc.text("SUB-REGISTRAR SIGNATURE", 142.5, y + 46, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.brown);
  doc.text("Authorized Officer", 142.5, y + 52, { align: "center" });

  // ============================================
  // FOOTER
  // ============================================

  doc.setDrawColor(...colors.amberLight);
  doc.setLineWidth(0.5);
  doc.line(20, H - 30, W - 20, H - 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.amberDeep);
  doc.text("✓ REGISTERED & VERIFIED ON BLOCKCHAIN", cx, H - 22, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...colors.slate400);
  doc.text(
    "This deed is legally binding and secured on the blockchain.",
    cx,
    H - 15,
    { align: "center" }
  );

  // Watermark
  doc.setTextColor(253, 250, 245);
  doc.setFont("times", "bold");
  doc.setFontSize(60);
  doc.text("LAND DEED", cx, H / 2 + 20, { align: "center" });

  return doc.output("blob");
}

// ============================================
// GENERIC WRAPPER
// ============================================

export async function generateSectorPDF(sector, data) {
  switch (sector) {
    case "education":
      return generateEducationPDF(data);
    case "government":
      return generateGovernmentPDF(data);
    case "healthcare":
      return generateHealthcarePDF(data);
    case "land":
      return generateLandPDF(data);
    default:
      return generateEducationPDF(data);
  }
}

// ============================================
// BACKWARDS COMPATIBILITY
// ============================================

export async function generateCertificatePDF(data) {
  return generateEducationPDF(data);
}

export function downloadPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}