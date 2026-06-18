import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Buyer from "../models/Buyer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const allowedSourceTypes = new Set([
    "manual",
    "public-directory",
    "trade-fair",
    "paid-data",
    "user-submitted",
]);

const inputPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(__dirname, "manualBuyerImport.example.json");

const normalizeList = (value) =>
    Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];

const validateRecord = (record, index) => {
    const label = `Buyer record ${index + 1}`;

    if (!record.companyName || /example|replace before import/i.test(record.companyName)) {
        throw new Error(`${label}: replace the placeholder companyName with a real legally sourced company.`);
    }
    if (!record.country || !record.sourceName || !record.sourceUrl) {
        throw new Error(`${label}: country, sourceName and sourceUrl are required.`);
    }
    if (!allowedSourceTypes.has(record.sourceType)) {
        throw new Error(`${label}: invalid sourceType.`);
    }
    if (record.sourceType === "paid-data" && !record.notes?.toLowerCase().includes("license")) {
        throw new Error(`${label}: paid-data imports require licensing evidence in notes.`);
    }

    return {
        companyName: String(record.companyName).trim(),
        country: String(record.country).trim(),
        city: String(record.city || "").trim(),
        industry: String(record.industry || record.productCategories?.[0] || "General trade").trim(),
        buyerType: String(record.buyerType || "importer").trim(),
        importerType: String(record.importerType || "").trim(),
        products: normalizeList(record.products),
        productCategories: normalizeList(record.productCategories),
        hsCodes: normalizeList(record.hsCodes),
        website: String(record.website || "").trim(),
        publicContactEmail: String(record.publicContactEmail || "").trim().toLowerCase(),
        sourceName: String(record.sourceName).trim(),
        sourceUrl: String(record.sourceUrl).trim(),
        sourceType: record.sourceType,
        verificationStatus: record.verificationStatus === "manually_verified" ? "manually_verified" : "unverified",
        verified: record.verificationStatus === "manually_verified",
        lastVerifiedAt: record.verificationStatus === "manually_verified" ? new Date(record.lastVerifiedAt || Date.now()) : undefined,
        notes: String(record.notes || "").trim(),
        isPublic: Boolean(record.isPublic && record.verificationStatus === "manually_verified"),
        isDemo: false,
    };
};

const run = async () => {
    const raw = await fs.readFile(inputPath, "utf8");
    const records = JSON.parse(raw);

    if (!Array.isArray(records) || !records.length) {
        throw new Error("Buyer import file must contain a non-empty JSON array.");
    }

    const normalized = records.map(validateRecord);
    await connectDB();

    for (const buyer of normalized) {
        await Buyer.findOneAndUpdate(
            { companyName: buyer.companyName, country: buyer.country, sourceUrl: buyer.sourceUrl },
            buyer,
            { upsert: true, new: true, runValidators: true },
        );
    }

    console.log(`Imported ${normalized.length} buyer/importer profile(s) from ${inputPath}.`);
};

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
