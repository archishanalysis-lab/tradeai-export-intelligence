import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Buyer from "../models/Buyer.js";
import Inquiry from "../models/Inquiry.js";
import Organization from "../models/Organization.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
    await connectDB();

    await Promise.all([
        Buyer.deleteMany({ source: "trade_data" }),
        Inquiry.deleteMany({ companyName: /Demo|Gulf|Euro/i }),
        Product.deleteMany({ name: /Demo|Organic Coffee|Cotton T-Shirts|Turmeric/i }),
        User.deleteMany({ email: /tradeai.test$/ }),
        Organization.deleteMany({ slug: "demo-exporters" }),
    ]);

    const organization = await Organization.create({
        name: "Demo Exporters Workspace",
        slug: "demo-exporters",
        plan: "ai_insights",
    });

    const users = await User.create([
        {
            name: "Demo Admin",
            email: "admin@tradeai.test",
            company: "TradeAI",
            role: "admin",
            password: "Password@123",
            organizationId: organization._id,
        },
        {
            name: "Demo Exporter",
            email: "exporter@tradeai.test",
            company: "TradeAI Exports",
            role: "exporter",
            password: "Password@123",
            organizationId: organization._id,
        },
        {
            name: "Demo Importer",
            email: "importer@tradeai.test",
            company: "Global Import House",
            role: "importer",
            password: "Password@123",
            organizationId: organization._id,
        },
    ]);

    organization.owner = users[0]._id;
    await organization.save();

    const exporter = users[1];

    const buyers = await Buyer.create([
        {
            companyName: "Gulf Retail Imports",
            country: "UAE",
            industry: "Food and beverage",
            products: ["coffee", "tea", "spices"],
            contactEmail: "imports@gulf.example",
            verified: true,
            tradeVolume: 4200000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
        {
            companyName: "Euro Apparel Distributors",
            country: "Germany",
            industry: "Textiles",
            products: ["cotton", "t-shirts", "apparel"],
            contactEmail: "buying@euroapparel.example",
            verified: true,
            tradeVolume: 6100000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
        {
            companyName: "US Natural Foods",
            country: "USA",
            industry: "Food and beverage",
            products: ["turmeric", "organic spices"],
            contactEmail: "sourcing@usfoods.example",
            verified: false,
            tradeVolume: 2800000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
    ]);

    const products = await Product.create([
        {
            name: "Organic Coffee Beans",
            category: "Food and beverage",
            hsCode: "0901",
            moq: 500,
            price: { amount: 4.5, currency: "USD" },
            exportCountry: "India",
            targetCountries: ["UAE", "Germany", "USA"],
            tags: ["coffee", "arabica", "organic"],
            keywords: ["coffee", "arabica", "organic"],
            availability: "available",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
        {
            name: "Cotton T-Shirts",
            category: "Textiles",
            hsCode: "6109",
            moq: 1000,
            price: { amount: 3.25, currency: "USD" },
            exportCountry: "India",
            targetCountries: ["Germany", "USA"],
            tags: ["cotton", "t-shirts", "apparel"],
            keywords: ["cotton", "tshirts", "textiles"],
            availability: "available",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
        {
            name: "Turmeric Powder",
            category: "Food and beverage",
            hsCode: "0910",
            moq: 250,
            price: { amount: 2.1, currency: "USD" },
            exportCountry: "India",
            targetCountries: ["USA", "UAE"],
            tags: ["turmeric", "spices", "organic"],
            keywords: ["turmeric", "spices", "organic"],
            availability: "limited",
            organizationId: organization._id,
            createdBy: exporter._id,
        },
    ]);

    await Inquiry.create([
        {
            buyer: buyers[0]._id,
            product: products[0]._id,
            exporter: exporter._id,
            buyerName: "Aisha Khan",
            buyerEmail: "aisha@gulf.example",
            companyName: "Gulf Retail Imports",
            message: "Please quote 2 tons for Dubai delivery.",
            status: "pending",
            negotiationMessages: [{ sender: "buyer", message: "Please quote 2 tons for Dubai delivery." }],
            organizationId: organization._id,
            createdBy: users[2]._id,
        },
        {
            buyer: buyers[1]._id,
            product: products[1]._id,
            exporter: exporter._id,
            buyerName: "Lukas Weber",
            buyerEmail: "lukas@euroapparel.example",
            companyName: "Euro Apparel Distributors",
            message: "Need samples for summer cotton t-shirt line.",
            status: "accepted",
            negotiationMessages: [{ sender: "buyer", message: "Need samples for summer cotton t-shirt line." }],
            organizationId: organization._id,
            createdBy: users[2]._id,
        },
    ]);

    console.log("Seed complete");
    console.log("Login: exporter@tradeai.test / Password@123");
    await mongoose.connection.close();
};

seed().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
});
