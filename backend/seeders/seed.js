import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import AiReport from "../models/AiReport.js";
import Buyer from "../models/Buyer.js";
import DemoIntelligence from "../models/DemoIntelligence.js";
import Inquiry from "../models/Inquiry.js";
import Organization from "../models/Organization.js";
import Product from "../models/Product.js";
import ReportRequest from "../models/ReportRequest.js";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
    await connectDB();

    await Promise.all([
        AiReport.deleteMany({ isDemo: true }),
        Buyer.deleteMany({
            $or: [
                { isDemo: true },
                { contactEmail: /\.example$/ },
                { companyName: /Gulf Retail Imports|Euro Apparel Distributors|US Natural Foods/i },
            ],
        }),
        DemoIntelligence.deleteMany({ isDemo: true }),
        Inquiry.deleteMany({
            $or: [
                { isDemo: true },
                { buyerEmail: /\.example$/ },
                { companyName: /Gulf Retail Imports|Euro Apparel Distributors/i },
            ],
        }),
        Product.deleteMany({
            $or: [
                { isDemo: true },
                { name: /Organic Coffee Beans|Cotton T-Shirts|Turmeric Powder|Basmati Rice/i },
            ],
        }),
        ReportRequest.deleteMany({ isDemo: true }),
        User.deleteMany({ email: /tradeai.test$/ }),
        Organization.deleteMany({ $or: [{ isDemo: true }, { slug: "demo-exporters" }] }),
    ]);

    const organization = await Organization.create({
        name: "Demo Exporters Workspace",
        slug: "demo-exporters",
        plan: "ai_insights",
        isDemo: true,
    });

    const users = await User.create([
        {
            name: "Demo Admin",
            email: "admin@tradeai.test",
            company: "TradeAI",
            role: "admin",
            password: "Password@123",
            organizationId: organization._id,
            isDemo: true,
        },
        {
            name: "Demo Exporter",
            email: "exporter@tradeai.test",
            company: "TradeAI Exports",
            role: "exporter",
            password: "Password@123",
            organizationId: organization._id,
            isDemo: true,
        },
        {
            name: "Demo Importer",
            email: "importer@tradeai.test",
            company: "Global Import House",
            role: "importer",
            password: "Password@123",
            organizationId: organization._id,
            isDemo: true,
        },
    ]);

    organization.owner = users[0]._id;
    await organization.save();

    const exporter = users[1];

    const buyers = await Buyer.create([
        {
            companyName: "Nairobi Retail Sourcing Hub",
            country: "Kenya",
            industry: "Food and grocery distribution",
            products: ["turmeric", "spices", "packaged foods"],
            contactEmail: "sourcing@nairobi-retail.example",
            verified: false,
            tradeVolume: 1180000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Mombasa Ingredient Traders",
            country: "Kenya",
            industry: "Food ingredients",
            products: ["spice blends", "chilli", "turmeric"],
            contactEmail: "imports@mombasa-ingredients.example",
            verified: false,
            tradeVolume: 740000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Dar es Salaam FMCG Buyers",
            country: "Tanzania",
            industry: "FMCG wholesale",
            products: ["tea", "rice", "spices"],
            contactEmail: "buyers@dar-fmcg.example",
            verified: false,
            tradeVolume: 930000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Kampala Wellness Imports",
            country: "Uganda",
            industry: "Health and wellness retail",
            products: ["herbal powders", "turmeric", "ayurvedic products"],
            contactEmail: "category@kampala-wellness.example",
            verified: false,
            tradeVolume: 680000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Dubai Premium Grocery Group",
            country: "UAE",
            industry: "Premium grocery",
            products: ["coffee", "tea", "organic spices"],
            contactEmail: "imports@dubai-premium-grocery.example",
            verified: false,
            tradeVolume: 4200000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Riyadh Foodservice Supply",
            country: "Saudi Arabia",
            industry: "Foodservice distribution",
            products: ["rice", "spices", "ready mixes"],
            contactEmail: "procurement@riyadh-foodservice.example",
            verified: false,
            tradeVolume: 2650000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Muscat Retail Distribution",
            country: "Oman",
            industry: "Retail distribution",
            products: ["textiles", "home goods", "packaged food"],
            contactEmail: "sourcing@muscat-retail.example",
            verified: false,
            tradeVolume: 860000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Doha Hospitality Buyers",
            country: "Qatar",
            industry: "Hospitality procurement",
            products: ["basmati rice", "spices", "tea"],
            contactEmail: "procurement@doha-hospitality.example",
            verified: false,
            tradeVolume: 1320000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            companyName: "Guangzhou Sourcing Office",
            country: "China",
            industry: "Import sourcing",
            products: ["cotton yarn", "textiles", "industrial inputs"],
            contactEmail: "category@guangzhou-sourcing.example",
            verified: false,
            tradeVolume: 3900000,
            source: "trade_data",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
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
            approvalStatus: "approved",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
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
            approvalStatus: "approved",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            name: "Turmeric Powder",
            category: "Food and beverage",
            hsCode: "0910",
            moq: 250,
            price: { amount: 2.1, currency: "USD" },
            exportCountry: "India",
            targetCountries: ["Kenya", "Uganda", "UAE"],
            tags: ["turmeric", "spices", "organic"],
            keywords: ["turmeric", "spices", "organic"],
            availability: "limited",
            approvalStatus: "approved",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
        {
            name: "Basmati Rice",
            category: "Food and beverage",
            hsCode: "1006",
            moq: 1000,
            price: { amount: 1.35, currency: "USD" },
            exportCountry: "India",
            targetCountries: ["Kenya", "Saudi Arabia", "Qatar"],
            tags: ["rice", "basmati", "staples"],
            keywords: ["rice", "basmati", "grocery"],
            availability: "available",
            approvalStatus: "approved",
            organizationId: organization._id,
            createdBy: exporter._id,
            isDemo: true,
        },
    ]);

    await Inquiry.create([
        {
            buyer: buyers[0]._id,
            product: products[2]._id,
            exporter: exporter._id,
            buyerName: "Grace Wanjiku",
            buyerEmail: "grace@nairobi-retail.example",
            companyName: "Nairobi Retail Sourcing Hub",
            message: "Please share sample pricing and packaging options for turmeric powder.",
            status: "pending",
            negotiationMessages: [
                { sender: "buyer", message: "Please share sample pricing and packaging options for turmeric powder." },
            ],
            organizationId: organization._id,
            createdBy: users[2]._id,
            isDemo: true,
        },
        {
            buyer: buyers[4]._id,
            product: products[0]._id,
            exporter: exporter._id,
            buyerName: "Omar Al Mansoori",
            buyerEmail: "omar@dubai-premium-grocery.example",
            companyName: "Dubai Premium Grocery Group",
            message: "Need sample pack details for organic coffee and specialty grocery sourcing.",
            status: "accepted",
            negotiationMessages: [
                { sender: "buyer", message: "Need sample pack details for organic coffee and specialty grocery sourcing." },
            ],
            organizationId: organization._id,
            createdBy: users[2]._id,
            isDemo: true,
        },
    ]);

    await DemoIntelligence.create([
        {
            type: "corridor_insight",
            title: "India-Kenya spice and packaged food corridor",
            corridor: "India to Kenya",
            country: "Kenya",
            sector: "Food and grocery distribution",
            hsCode: "0910",
            sourceLabel: "Sample intelligence based on MVP corridor assumptions",
            summary: "Kenya is useful for testing TradeAI's exporter journey because spices, packaged foods and ingredient distribution create a clear buyer discovery use case.",
            signals: [
                "Urban retail and wholesale demand is concentrated around Nairobi and Mombasa.",
                "Importer conversations often require documentation clarity before price negotiation.",
                "Sample buyer matching should focus on distributors, supermarkets and ingredient traders.",
            ],
            challenges: [
                "Do not treat demo demand as live market data.",
                "Import duties, standards and documentation should be verified before commercial action.",
            ],
            suggestedActions: [
                "Ask Copilot for Kenya buyer segments.",
                "Request a sample export opportunity report.",
                "Shortlist HS codes and documentation needs before outreach.",
            ],
            isDemo: true,
        },
        {
            type: "corridor_insight",
            title: "India-GCC premium grocery opportunity",
            corridor: "India to Gulf / GCC",
            country: "UAE",
            sector: "Premium grocery and foodservice",
            hsCode: "0901",
            sourceLabel: "Sample intelligence for private MVP preview",
            summary: "GCC markets are useful for demonstrating premium positioning, re-export potential and buyer segmentation workflows.",
            signals: [
                "Premium grocery, hospitality and specialty retail can be separated into distinct outreach lists.",
                "Dubai can act as both destination and regional distribution hub in sample workflows.",
            ],
            challenges: [
                "Halal, labelling and importer documentation requirements must be validated.",
                "Buyer profiles in this seed are examples only, not verified companies.",
            ],
            suggestedActions: [
                "Compare UAE, Saudi Arabia, Oman and Qatar in dashboard filters.",
                "Use report requests for paid market validation later.",
            ],
            isDemo: true,
        },
        {
            type: "hs_code_opportunity",
            title: "Turmeric powder opportunity sample",
            corridor: "India to Kenya",
            country: "Kenya",
            sector: "Spices",
            hsCode: "0910",
            sourceLabel: "Sample HS opportunity for MVP demo",
            summary: "HS 0910 can demonstrate how TradeAI explains product classification, buyer category direction and documentation readiness.",
            signals: [
                "Potential buyer categories include ingredient traders, supermarkets and wellness retailers.",
                "The MVP can score opportunity quality using country fit, product fit and buyer availability.",
            ],
            challenges: [
                "Final HS classification and duty impact must be verified with a trade professional.",
            ],
            suggestedActions: [
                "Build a Kenya report request for turmeric.",
                "Prepare product specification and packaging details.",
            ],
            isDemo: true,
        },
        {
            type: "hs_code_opportunity",
            title: "Basmati rice opportunity sample",
            corridor: "India to GCC",
            country: "Qatar",
            sector: "Staple foods",
            hsCode: "1006",
            sourceLabel: "Sample HS opportunity for MVP demo",
            summary: "HS 1006 can demonstrate repeat purchase potential, hospitality procurement and commodity-style pricing sensitivity.",
            signals: [
                "Buyer segments include hospitality procurement, grocery distributors and foodservice importers.",
                "Packaging, origin and grade details should be captured before outreach.",
            ],
            challenges: [
                "Margins can be sensitive to freight cost and large-volume buyer negotiation.",
            ],
            suggestedActions: [
                "Ask Copilot for Qatar buyer segment prioritization.",
                "Create a report request for price and buyer discovery validation.",
            ],
            isDemo: true,
        },
        {
            type: "report_metadata",
            title: "Sample India-Kenya turmeric export opportunity report",
            corridor: "India to Kenya",
            country: "Kenya",
            sector: "Spices",
            hsCode: "0910",
            sourceLabel: "TradeAI MVP sample report metadata",
            summary: "Private-preview sample metadata for a turmeric export opportunity report from India to Kenya.",
            signals: [
                "Report objective: buyer segment discovery and opportunity scoring.",
                "Suggested audience: SME exporter, consultant or mentor reviewer.",
                "Recommended next step: validate real import data before paid report delivery.",
            ],
            challenges: [
                "This metadata is demo-only and should not be interpreted as verified market research.",
            ],
            suggestedActions: [
                "Review exporter/importer journey clarity.",
                "Check whether report sections feel useful to business stakeholders.",
            ],
            metadata: {
                originCountry: "India",
                targetCountry: "Kenya",
                productName: "Turmeric Powder",
                reportType: "Export Opportunity Preview",
                readinessRating: "MVP sample",
                isPaidReport: false,
            },
            isDemo: true,
        },
    ]);

    await ReportRequest.create({
        name: "Demo Exporter",
        email: "exporter@tradeai.test",
        company: "TradeAI Exports",
        roleType: "exporter",
        productName: "Turmeric Powder",
        hsCode: "0910",
        originCountry: "India",
        targetCountry: "Kenya",
        businessType: "SME exporter",
        reportObjective: "Validate buyer categories, HS code readiness and Kenya market fit.",
        message: "Demo request for the India-Kenya turmeric export opportunity report metadata.",
        source: "seed-demo-report",
        status: "new",
        priority: "Medium priority",
        isDemo: true,
    });

    await AiReport.create({
        organizationId: organization._id,
        createdBy: exporter._id,
        title: "Sample India-Kenya Turmeric Opportunity Report",
        reportType: "buyer_opportunity",
        prompt: "Create a sample MVP export opportunity report for turmeric from India to Kenya.",
        product: "Turmeric Powder",
        hsCode: "0910",
        targetCountry: "Kenya",
        answer: "Demo-only report metadata covering buyer segments, HS code readiness, trade challenges and suggested next actions for India-Kenya turmeric exports.",
        suggestedActions: [
            "Validate live trade data before commercial use.",
            "Shortlist distributors and ingredient buyers.",
            "Confirm documentation and labelling requirements.",
        ],
        provider: "seed-demo-data",
        exportFormats: ["pdf", "csv"],
        status: "generated",
        isDemo: true,
    });

    console.log("Seed complete");
    console.log("Demo records are marked with isDemo: true and sample buyers are not verified real companies.");
    console.log("Login: exporter@tradeai.test / Password@123");
    await mongoose.connection.close();
};

seed().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
});
