const { validationResult } = require("express-validator");
const Partner = require("../models/partner.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const bcrypt = require("bcrypt");

// ✅ Login Partner
exports.loginPartner = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const partner = await Partner.findOne({ email }).select("+password");
  if (!partner)
    return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await partner.comparePassword(password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = partner.generateAuthToken();
  res.cookie("token", token);
  res.status(200).json({ token, partner });
};

// ✅ Get Partner Profile
exports.getPartnerProfile = async (req, res) => {
  res.status(200).json(req.partner);
};

// ✅ Logout Partner
exports.logoutPartner = async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await blacklistTokenModel.create({ token });
  }
  res.status(200).json({ message: "Logged out" });
};

// ✅ Register Partner with validation
exports.registerPartner = async (req, res) => {
  try {
    // Debug logging
    console.log("=== DEBUG INFO ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    // Check validation errors first
    const errors = validationResult(req);
    console.log("Validation errors:", errors.array());
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      categories,
      priceRange,
      status,
      portfolioUrl,
      serviceDescription,
      phone,
    } = req.body;

    // ✅ Email uniqueness check
    const exists = await Partner.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    // ✅ Aadhaar file required
    if (!req.files?.aadharFile) {
      return res.status(400).json({ message: "Aadhaar document is required" });
    }

    // ✅ Prefer portfolioUrl over file
    let finalPortfolioUrl = portfolioUrl;
    if (!portfolioUrl && req.files?.portfolioFile) {
      finalPortfolioUrl = `/uploads/partners/${req.files.portfolioFile[0].filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await Partner.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      categories: Array.isArray(categories) ? categories : [categories],
      priceRange,
      status: status || 1,
      aadharFileUrl: `/uploads/partners/${req.files.aadharFile[0].filename}`,
      portfolioUrl: finalPortfolioUrl,
      serviceDescription,
      phone,
    });

    const { password: _, ...partnerData } = partner.toObject();
    res.status(201).json(partnerData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};