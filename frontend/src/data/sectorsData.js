// ============================================
// SATYA-CHAIN — Multi-Sector Data
// ============================================

export const SECTORS = {
  education: {
    id: "education",
    name: "Education",
    icon: "🎓",
    tagline: "Degrees & Certificates",
    color: "indigo",
    description: "University degrees, course certificates, mark sheets",
    issueLabel: "Issue Certificate",
    verifyLabel: "Verify Certificate",
    recordLabel: "Certificates",
    stats: {
      total: 1234,
      verified: 1200,
      revoked: 34
    },
    recentRecords: [
      {
        id: "EDU-2024-001",
        holder: "Rahul Sharma",
        type: "B.Tech Computer Science",
        date: "2024-09-15",
        status: "verified"
      },
      {
        id: "EDU-2024-002",
        holder: "Priya Patel",
        type: "M.Tech Data Science",
        date: "2024-09-12",
        status: "verified"
      },
      {
        id: "EDU-2024-003",
        holder: "Amit Kumar",
        type: "B.Com Honors",
        date: "2024-09-10",
        status: "verified"
      },
      {
        id: "EDU-2024-004",
        holder: "Sneha Reddy",
        type: "B.Sc Physics",
        date: "2024-09-08",
        status: "revoked"
      }
    ]
  },

  government: {
    id: "government",
    name: "Government IDs",
    icon: "🆔",
    tagline: "Aadhaar, PAN, DL & More",
    color: "cyan",
    description: "Aadhaar, PAN, Driving License, Passport, Voter ID",
    issueLabel: "Issue ID",
    verifyLabel: "Verify ID",
    recordLabel: "IDs",
    stats: {
      total: 5678,
      verified: 5500,
      revoked: 178
    },
    recentRecords: [
      {
        id: "GOV-AADH-001",
        holder: "Amit Kumar",
        type: "Aadhaar Card",
        date: "2024-09-20",
        status: "verified"
      },
      {
        id: "GOV-PAN-002",
        holder: "Sneha Reddy",
        type: "PAN Card",
        date: "2024-09-18",
        status: "verified"
      },
      {
        id: "GOV-DL-003",
        holder: "Rajesh Singh",
        type: "Driving License",
        date: "2024-09-15",
        status: "verified"
      },
      {
        id: "GOV-PASS-004",
        holder: "Meera Joshi",
        type: "Passport",
        date: "2024-09-12",
        status: "verified"
      },
      {
        id: "GOV-VOTER-005",
        holder: "Vikram Sharma",
        type: "Voter ID",
        date: "2024-09-10",
        status: "revoked"
      }
    ]
  },

  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    tagline: "Patient Records & Prescriptions",
    color: "emerald",
    description: "Medical records, prescriptions, insurance documents",
    issueLabel: "Issue Record",
    verifyLabel: "Verify Record",
    recordLabel: "Records",
    stats: {
      total: 3421,
      verified: 3300,
      revoked: 121
    },
    recentRecords: [
      {
        id: "HLT-PRES-001",
        holder: "Rahul Sharma",
        type: "Prescription — Cardiology",
        date: "2024-09-22",
        status: "verified"
      },
      {
        id: "HLT-MED-002",
        holder: "Priya Patel",
        type: "Medical Report — Blood Test",
        date: "2024-09-20",
        status: "verified"
      },
      {
        id: "HLT-INS-003",
        holder: "Amit Kumar",
        type: "Health Insurance Policy",
        date: "2024-09-18",
        status: "verified"
      },
      {
        id: "HLT-VAC-004",
        holder: "Sneha Reddy",
        type: "Vaccination Certificate",
        date: "2024-09-15",
        status: "verified"
      }
    ]
  },

  land: {
    id: "land",
    name: "Land & Property",
    icon: "🏠",
    tagline: "Titles, Deeds & Registry",
    color: "amber",
    description: "Property titles, sale deeds, mutation records",
    issueLabel: "Issue Deed",
    verifyLabel: "Verify Deed",
    recordLabel: "Deeds",
    stats: {
      total: 891,
      verified: 850,
      revoked: 41
    },
    recentRecords: [
      {
        id: "LAND-TTL-001",
        holder: "Rajesh Singh",
        type: "Property Title — Mumbai",
        date: "2024-09-21",
        status: "verified"
      },
      {
        id: "LAND-DEED-002",
        holder: "Meera Joshi",
        type: "Sale Deed — Pune",
        date: "2024-09-19",
        status: "verified"
      },
      {
        id: "LAND-MUT-003",
        holder: "Vikram Sharma",
        type: "Mutation Record — Delhi",
        date: "2024-09-16",
        status: "verified"
      },
      {
        id: "LAND-LEASE-004",
        holder: "Kavita Nair",
        type: "Lease Agreement — Bangalore",
        date: "2024-09-14",
        status: "revoked"
      }
    ]
  }
};

// Sector list for tabs
export const SECTOR_LIST = [
  SECTORS.education,
  SECTORS.government,
  SECTORS.healthcare,
  SECTORS.land
];

// Color mapping for Tailwind classes
export const SECTOR_COLORS = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-indigo-600",
    badge: "bg-indigo-100 text-indigo-700"
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
    gradient: "from-cyan-500 to-cyan-600",
    badge: "bg-cyan-100 text-cyan-700"
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
    badge: "bg-emerald-100 text-emerald-700"
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-600",
    badge: "bg-amber-100 text-amber-700"
  }
};