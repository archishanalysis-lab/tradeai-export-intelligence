const focusCountryGuidance = {
    Kenya: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Product certificate, health certificate or inspection document where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Kenya Revenue Authority customs requirements and relevant Kenya Bureau of Standards product rules before shipment.",
            "Food, pharma, chemicals and regulated goods may need importer-led permits, standards checks or product registration.",
        ],
        commonRiskNotes: [
            "Validate importer identity, labelling, shelf life and port/inland logistics before dispatch.",
            "Confirm exact HS classification before quoting landed cost.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Kenya tariff data; verify duty, taxes and exemptions with official tariff sources or a CHA/customs broker.",
        paymentRiskNotes:
            "For new buyers, prefer advance, LC at sight, escrow or partial advance with document control. Avoid open account until trade history exists.",
        logisticsNote:
            "Mombasa is a common sea gateway; plan inland movement, port handling time, document readiness and demurrage exposure.",
    },
    Tanzania: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Product-specific permit or standards certificate where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Tanzania Revenue Authority customs guidance and Tanzania Bureau of Standards requirements for regulated goods.",
            "Importer support is important for permits, standards inspection and port clearance coordination.",
        ],
        commonRiskNotes: [
            "Confirm Dar es Salaam clearance process, product standards and importer documentation before shipment.",
            "Land transport and port delays can affect delivery commitments.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Tanzania tariff data; verify EAC/Tanzania duty and taxes with official sources or a CHA/customs broker.",
        paymentRiskNotes:
            "Use safer terms for first shipments, with document-linked payment milestones and clear dispute handling.",
        logisticsNote:
            "Dar es Salaam is the key sea route; confirm freight validity, port storage, inland delivery and insurance.",
    },
    Uganda: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Import permit or standards certificate where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Uganda Revenue Authority customs requirements and Uganda National Bureau of Standards rules for regulated categories.",
            "Because Uganda is land-linked, importer and clearing-agent coordination is important.",
        ],
        commonRiskNotes: [
            "Plan for inland transit, border clearance and payment security.",
            "Validate buyer reliability before committing bulk shipments.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Uganda tariff data; verify EAC/Uganda tariff treatment with official sources or a CHA/customs broker.",
        paymentRiskNotes:
            "For new counterparties, avoid open account. Prefer advance, LC, escrow or staged terms backed by documents.",
        logisticsNote:
            "Shipments often move via regional ports and inland corridors; confirm total transit time and handoff responsibility.",
    },
    Rwanda: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Transport document",
            "Certificate of origin",
            "Product-specific conformity or health certificate where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Rwanda Revenue Authority and Rwanda Standards Board requirements before final pricing.",
            "Importer-led confirmation is important for regulated food, pharma, chemicals and electronics.",
        ],
        commonRiskNotes: [
            "Smaller market size can make MOQ, freight and distributor fit more important.",
            "Validate inland logistics cost before quoting.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Rwanda tariff data; verify EAC/Rwanda duty, taxes and rules of origin with official sources.",
        paymentRiskNotes:
            "Use secure payment terms and keep first shipments modest until buyer performance is proven.",
        logisticsNote:
            "Plan regional port plus inland movement; confirm who controls customs clearance and final delivery.",
    },
    UAE: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Health, halal, conformity or product certificate where applicable",
        ],
        complianceAuthorityNotes: [
            "Check UAE customs, municipality and product-specific regulator requirements for the exact emirate and product category.",
            "Food, cosmetics, electronics and regulated goods may need registration or conformity checks.",
        ],
        commonRiskNotes: [
            "Competition and distributor margins can be high; validate landed cost and channel fit.",
            "Arabic/English labels, shelf life and packaging requirements may affect readiness.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live UAE tariff data; verify GCC/UAE duty, VAT and exemptions with official sources or a customs broker.",
        paymentRiskNotes:
            "For new distributors, use advance, LC, escrow or staged payment until trade history and credit comfort are established.",
        logisticsNote:
            "Jebel Ali/Dubai routes can support re-export; confirm whether the buyer is importing for UAE sale or onward distribution.",
    },
    "Saudi Arabia": {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "SABER/SASO, SFDA, halal or product registration documents where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Saudi customs, ZATCA and product-specific regulators such as SFDA or SASO/SABER before shipment.",
            "Arabic labelling, conformity and importer registration can be critical for regulated goods.",
        ],
        commonRiskNotes: [
            "Compliance preparation can be heavier than smaller Gulf markets.",
            "Confirm importer readiness before manufacturing or dispatching regulated products.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Saudi tariff data; verify GCC/Saudi duty, VAT and product-specific requirements with official sources.",
        paymentRiskNotes:
            "Use LC, advance or staged document-linked terms for new buyers. Avoid open account without strong credit checks.",
        logisticsNote:
            "Confirm destination port, Arabic documentation, conformity workflow and final consignee responsibility early.",
    },
    Oman: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Product certificate or conformity document where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Oman customs and relevant standards/product authority requirements before shipment.",
            "Importer guidance is important for category-specific permits and GCC conformity expectations.",
        ],
        commonRiskNotes: [
            "Market size and distributor concentration can affect repeat demand.",
            "Compare direct Oman entry against UAE re-export economics.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Oman tariff data; verify GCC/Oman duty and taxes with official sources or a customs broker.",
        paymentRiskNotes:
            "For first shipments, prefer advance, LC or staged payment terms with document control.",
        logisticsNote:
            "Confirm port route, delivery terms and whether the buyer expects direct import or regional consolidation.",
    },
    Qatar: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Health, halal, conformity or product certificate where applicable",
        ],
        complianceAuthorityNotes: [
            "Check Qatar customs and product-specific requirements for food, health, construction and regulated goods.",
            "Importer-led clearance and labelling confirmation should happen before dispatch.",
        ],
        commonRiskNotes: [
            "Premium positioning can help, but MOQ and distributor fit need validation.",
            "Confirm product registration or certificate expectations for regulated categories.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live Qatar tariff data; verify GCC/Qatar duty and taxes with official sources or a customs broker.",
        paymentRiskNotes:
            "Use secure terms for new buyers and tie document release to payment milestones where possible.",
        logisticsNote:
            "Confirm air versus sea route, importer clearance role, packaging and delivery timeline before quoting.",
    },
    China: {
        documents: [
            "Commercial invoice",
            "Packing list",
            "Bill of lading or airway bill",
            "Certificate of origin",
            "Inspection, quarantine, CCC or product-specific documents where applicable",
        ],
        complianceAuthorityNotes: [
            "Check China customs and product regulator requirements for the exact HS code and intended use.",
            "For import sourcing into India, also verify India import rules, BIS/FSSAI/other standards and supplier documents.",
        ],
        commonRiskNotes: [
            "For exports, China can have high compliance and competition barriers.",
            "For sourcing, verify supplier identity, quality documents, inspection and payment controls.",
        ],
        tariffGuidanceDisclaimer:
            "Curated guidance only. This is not live China tariff data; verify China customs or India import duty data with official sources for the exact flow.",
        paymentRiskNotes:
            "For sourcing, avoid full advance without inspection. Use samples, staged payment, escrow or LC where practical.",
        logisticsNote:
            "Clarify whether the workflow is India-to-China export or China-to-India sourcing, then validate port route and inspection responsibilities.",
    },
};

const focusCountryNames = Object.keys(focusCountryGuidance);

const getFocusCountryGuidance = (country = "") => {
    const normalized = String(country || "").trim().toLowerCase();
    return (
        focusCountryNames.find((name) => name.toLowerCase() === normalized || (normalized === "uae" && name === "UAE")) ||
        ""
    );
};

const getCuratedGuidance = (country = "") => {
    const key = getFocusCountryGuidance(country);
    return key ? { country: key, ...focusCountryGuidance[key], sourceLabel: "Curated guidance" } : null;
};

export { focusCountryGuidance, focusCountryNames, getCuratedGuidance };
