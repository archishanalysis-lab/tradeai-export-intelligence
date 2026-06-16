const customsLastUpdated = "2026-06-16";

const customsProductCategories = [
    "Food/agri",
    "Pharma",
    "Chemicals",
    "Electronics",
    "Textiles",
    "Machinery",
    "General goods",
];

const customsDisclaimer =
    "Customs clearance guidance is educational and sample/manual only. Customs clearance should be handled with a licensed CHA/customs broker where required. Verify HS code, duty, documents, licences, restrictions and clearance process with Customs, DGFT, ICEGATE, a CHA/customs broker, freight forwarder, bank or qualified professional before shipment.";

const productRiskWarnings = {
    "Food/agri": [
        "Check FSSAI/APEDA/phytosanitary or destination food authority requirements where applicable.",
        "Confirm shelf life, labelling, temperature control and inspection requirements before booking.",
    ],
    Pharma: [
        "Check drug licence, product registration and health authority clearance before shipment.",
        "Batch documents and regulatory approvals may be needed before customs filing.",
    ],
    Chemicals: [
        "Confirm MSDS, hazardous goods classification and restricted chemical status before booking.",
        "Carrier DG acceptance and packaging rules may affect clearance timeline.",
    ],
    Electronics: [
        "Check BIS/WPC or conformity requirements where applicable.",
        "Technical specs, model numbers and serial details should match documents.",
    ],
    Textiles: [
        "Check composition, origin, labelling and inspection requirements where buyer or destination requires them.",
    ],
    Machinery: [
        "Confirm technical documents, inspection certificate and new/used machinery restrictions where applicable.",
    ],
    "General goods": [
        "Confirm exact HS code, duty and restricted/prohibited status before filing customs documents.",
    ],
};

const baseDocuments = {
    export: [
        "IEC",
        "Commercial Invoice",
        "Packing List",
        "Shipping Bill",
        "Bill of Lading / Airway Bill",
        "Certificate of Origin where applicable",
        "Insurance Certificate where applicable",
        "Bank/export payment documentation",
    ],
    import: [
        "IEC",
        "Commercial Invoice",
        "Packing List",
        "Bill of Entry",
        "Bill of Lading / Airway Bill",
        "Certificate of Origin where applicable",
        "Insurance Certificate",
        "Duty payment challan",
        "Product-specific certificates where applicable",
    ],
};

const customsWorkflows = [
    {
        direction: "export",
        title: "Export clearance from India",
        baseComplexity: 5,
        steps: [
            {
                step: 1,
                name: "IEC check",
                description: "Confirm the exporter has an active IEC and business details are aligned with trade documents.",
                handledBy: ["exporter", "CHA/customs broker", "bank"],
                requiredDocuments: ["IEC", "PAN/GST/business details where applicable"],
                riskWarnings: ["Mismatch in exporter details can delay documentation and bank processing."],
            },
            {
                step: 2,
                name: "HS code classification",
                description: "Identify the correct HS code before preparing invoice, duty/compliance notes and shipping bill.",
                handledBy: ["exporter", "CHA/customs broker"],
                requiredDocuments: ["Product catalogue/specification", "HS classification note where available"],
                riskWarnings: ["Wrong HS code can trigger assessment delays, penalties or document correction."],
            },
            {
                step: 3,
                name: "Invoice and packing list preparation",
                description: "Prepare commercial invoice and packing list with product, quantity, value, Incoterms and shipment details.",
                handledBy: ["exporter", "freight forwarder"],
                requiredDocuments: ["Commercial Invoice", "Packing List", "Purchase Order"],
                riskWarnings: ["Invoice, packing list and shipping details must match."],
            },
            {
                step: 4,
                name: "Shipping bill filing",
                description: "File shipping bill on ICEGATE/customs system through the CHA/customs broker.",
                handledBy: ["CHA/customs broker", "exporter"],
                requiredDocuments: ["Shipping Bill", "Invoice", "Packing List", "Authorisation to CHA"],
                riskWarnings: ["Product restrictions, scheme claims or missing certificates can delay filing."],
            },
            {
                step: 5,
                name: "Customs assessment",
                description: "Customs reviews declaration, HS code, value, incentives and product restrictions.",
                handledBy: ["Customs", "CHA/customs broker"],
                requiredDocuments: ["Shipping Bill", "Supporting certificates where applicable"],
                riskWarnings: ["Queries may be raised for valuation, HS code or compliance documents."],
            },
            {
                step: 6,
                name: "Examination if required",
                description: "Cargo may be examined or scanned depending on risk, product and customs instructions.",
                handledBy: ["Customs", "CHA/customs broker", "freight forwarder"],
                requiredDocuments: ["Examination order where applicable", "Packing details"],
                riskWarnings: ["High-risk or regulated goods can face additional inspection."],
            },
            {
                step: 7,
                name: "Let Export Order",
                description: "Customs grants Let Export Order after assessment/examination is complete.",
                handledBy: ["Customs", "CHA/customs broker"],
                requiredDocuments: ["Final shipping bill/LEO status"],
                riskWarnings: ["Cargo should not be treated as cleared until LEO is granted."],
            },
            {
                step: 8,
                name: "Port/air cargo handover",
                description: "Cargo is handed to port, CFS, airline or carrier for loading/export movement.",
                handledBy: ["freight forwarder", "carrier", "exporter"],
                requiredDocuments: ["Carting order/terminal documents", "Carrier booking"],
                riskWarnings: ["Missed cutoff can create storage, rollover or amendment costs."],
            },
            {
                step: 9,
                name: "Bill of Lading/Airway Bill",
                description: "Carrier issues transport document after cargo acceptance/loading.",
                handledBy: ["freight forwarder", "carrier"],
                requiredDocuments: ["Bill of Lading / Airway Bill", "Shipping instructions"],
                riskWarnings: ["Transport document details must match LC/buyer requirements if applicable."],
            },
            {
                step: 10,
                name: "Export payment realization",
                description: "Track buyer payment, bank realization and export records after shipment.",
                handledBy: ["exporter", "bank"],
                requiredDocuments: ["Invoice", "Shipping Bill", "Transport document", "Bank realization/export payment documentation"],
                riskWarnings: ["Delayed realization can create banking/compliance follow-up."],
            },
        ],
    },
    {
        direction: "import",
        title: "Import clearance into India",
        baseComplexity: 6,
        steps: [
            {
                step: 1,
                name: "IEC check",
                description: "Confirm importer IEC, KYC and business details before shipment documents are finalised.",
                handledBy: ["importer", "CHA/customs broker", "bank"],
                requiredDocuments: ["IEC", "Importer KYC", "Purchase contract/PO"],
                riskWarnings: ["IEC or importer detail mismatch can delay bill of entry filing."],
            },
            {
                step: 2,
                name: "HS code classification",
                description: "Confirm HS code, duty structure, restrictions and product-specific approvals before import.",
                handledBy: ["importer", "CHA/customs broker"],
                requiredDocuments: ["Product catalogue/specification", "Supplier declaration", "HS classification note where available"],
                riskWarnings: ["Wrong HS code can change duty, licence requirement or clearance path."],
            },
            {
                step: 3,
                name: "Bill of Entry filing",
                description: "CHA/customs broker files bill of entry using supplier and shipment documents.",
                handledBy: ["CHA/customs broker", "importer"],
                requiredDocuments: ["Bill of Entry", "Commercial Invoice", "Packing List", "Bill of Lading / Airway Bill"],
                riskWarnings: ["Late filing or document mismatch can create penalties and storage charges."],
            },
            {
                step: 4,
                name: "Document submission",
                description: "Submit supporting documents, licences, certificates and declarations required for assessment.",
                handledBy: ["CHA/customs broker", "importer", "product regulator where applicable"],
                requiredDocuments: ["Certificate of Origin", "Insurance Certificate", "Product-specific certificates", "Import licence where applicable"],
                riskWarnings: ["Missing product certificates can stop customs clearance."],
            },
            {
                step: 5,
                name: "Duty assessment",
                description: "Customs assesses classification, value, duty, tax and applicable exemptions or preference claims.",
                handledBy: ["Customs", "CHA/customs broker"],
                requiredDocuments: ["Bill of Entry", "Valuation support", "Certificate of Origin where preference claimed"],
                riskWarnings: ["Valuation, related-party or origin queries can delay assessment."],
            },
            {
                step: 6,
                name: "Duty payment",
                description: "Importer pays assessed customs duty, IGST and charges through approved channels.",
                handledBy: ["importer", "bank", "CHA/customs broker"],
                requiredDocuments: ["Duty payment challan", "Bill of Entry assessment"],
                riskWarnings: ["Payment delay may increase port, CFS, demurrage or detention charges."],
            },
            {
                step: 7,
                name: "Customs examination if required",
                description: "Customs may examine cargo depending on risk, product, valuation or compliance triggers.",
                handledBy: ["Customs", "CHA/customs broker", "freight forwarder"],
                requiredDocuments: ["Examination order where applicable", "Packing details"],
                riskWarnings: ["Regulated goods can require additional testing or agency approval."],
            },
            {
                step: 8,
                name: "Out of Charge",
                description: "Customs grants Out of Charge after assessment, payment and examination are complete.",
                handledBy: ["Customs", "CHA/customs broker"],
                requiredDocuments: ["Out of Charge status", "Final Bill of Entry"],
                riskWarnings: ["Goods should not be moved for delivery until Out of Charge is granted."],
            },
            {
                step: 9,
                name: "Delivery order",
                description: "Carrier/forwarder issues delivery order after freight and local charges are settled.",
                handledBy: ["freight forwarder", "carrier", "importer"],
                requiredDocuments: ["Delivery Order", "Original/telex release BL or AWB", "Freight/local charge payment proof"],
                riskWarnings: ["Unpaid local charges can delay delivery even after customs clearance."],
            },
            {
                step: 10,
                name: "Goods delivery",
                description: "Cargo is moved from port/CFS/airport to importer warehouse or final delivery point.",
                handledBy: ["freight forwarder", "transporter", "importer"],
                requiredDocuments: ["Gate pass", "Delivery challan", "Transport documents"],
                riskWarnings: ["Plan unloading, insurance and inland transport to avoid detention and damage disputes."],
            },
        ],
    },
];

export {
    baseDocuments,
    customsDisclaimer,
    customsLastUpdated,
    customsProductCategories,
    customsWorkflows,
    productRiskWarnings,
};
