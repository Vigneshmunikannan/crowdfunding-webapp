const Company = require("../models/Company");

async function listCompanies(_req, res) {
  const companies = await Company.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .lean();

  res.json({
    success: true,
    companies: companies.map((doc) => Company.formatPublic(doc)),
  });
}

async function createCompany(req, res) {
  const { name, description, contactEmail } = req.body;

  const company = await Company.create({
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
    contactEmail: contactEmail.toLowerCase().trim(),
    createdBy: req.user.id,
  });

  await company.populate("createdBy", "name email");

  res.status(201).json({
    success: true,
    company: company.toPublicObject(),
  });
}

async function updateCompany(req, res) {
  const { id } = req.params;
  const { name, description, contactEmail } = req.body;

  const company = await Company.findById(id);
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }

  if (name !== undefined) company.name = name.trim();
  if (description !== undefined) {
    company.description =
      typeof description === "string" ? description.trim() : "";
  }
  if (contactEmail !== undefined) {
    company.contactEmail = contactEmail.toLowerCase().trim();
  }

  await company.save();
  await company.populate("createdBy", "name email");

  res.json({
    success: true,
    company: company.toPublicObject(),
  });
}

async function deleteCompany(req, res) {
  const { id } = req.params;

  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({
    success: true,
    message: "Company deleted",
  });
}

module.exports = {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
