const lastUpdated = "2026-06-16";

const focusCountries = [
    "Kenya",
    "Tanzania",
    "Uganda",
    "Rwanda",
    "UAE",
    "Saudi Arabia",
    "Oman",
    "Qatar",
    "China",
];

const commonExportDocuments = [
    "IEC",
    "Commercial Invoice",
    "Packing List",
    "Shipping Bill",
    "Bill of Lading / Airway Bill",
    "Certificate of Origin",
    "Insurance Certificate if applicable",
    "LUT/Bond if applicable",
    "Bank realization/export payment documentation",
];

const commonImportDocuments = [
    "IEC",
    "Commercial Invoice",
    "Packing List",
    "Bill of Entry",
    "Bill of Lading / Airway Bill",
    "Certificate of Origin if applicable",
    "Insurance Certificate",
    "Import license if restricted",
    "Product-specific certificates",
];

const countryNotes = {
    Kenya: "Check Kenya Bureau of Standards requirements, import standards mark rules where applicable and destination buyer documentation before shipment.",
    Tanzania: "Check Tanzania standards, destination inspection requirements and any product registration needs before shipping.",
    Uganda: "Confirm Uganda standards and buyer-side import clearance requirements, especially for regulated consumer goods.",
    Rwanda: "Check Rwanda standards, packaging/labelling expectations and destination clearance documents with importer or CHA.",
    UAE: "Confirm UAE/GCC labelling, certificate of origin, halal or municipality approvals where product-specific rules apply.",
    "Saudi Arabia": "Check SABER/SASO, halal, product registration and Arabic labelling requirements where applicable.",
    Oman: "Confirm Oman/GCC customs, labelling, origin and product-specific import approval requirements.",
    Qatar: "Check Qatar/GCC labelling, conformity and ministry approvals where product-specific controls apply.",
    China: "Check China customs, CIQ/GACC registration, labelling, origin and product-specific import requirements with buyer and broker.",
};

const productProfiles = [
    {
        productCategory: "Food/agri",
        hsCodePrefix: "09, 10, 11, 12, 20",
        productSpecificDocuments: [
            "FSSAI licence/registration where applicable",
            "APEDA registration or certificate where applicable",
            "Phytosanitary certificate for plant-origin goods where applicable",
            "Health certificate or sanitary certificate where required",
        ],
        authorityOrDepartment: ["FSSAI", "APEDA", "Plant Quarantine", "DGFT", "Customs", "Destination food authority"],
        riskLevel: "high",
        notes: "Food and agri shipments often need product, origin, residue, labelling, shelf-life and destination food-safety verification.",
    },
    {
        productCategory: "Pharma",
        hsCodePrefix: "30",
        productSpecificDocuments: [
            "Drug licence",
            "Regulatory approval or product registration where required",
            "Certificate of Pharmaceutical Product if applicable",
            "Batch release/analysis certificate where applicable",
        ],
        authorityOrDepartment: ["CDSCO", "State Drug Controller", "DGFT", "Customs", "Destination health authority"],
        riskLevel: "high",
        notes: "Pharma trade is highly regulated. Confirm product registration, prescription/OTC status and importing-country health authority rules before shipment.",
    },
    {
        productCategory: "Chemicals",
        hsCodePrefix: "28, 29, 32, 38",
        productSpecificDocuments: [
            "Material Safety Data Sheet",
            "Dangerous goods declaration if applicable",
            "Technical data sheet",
            "Certificate of analysis where applicable",
        ],
        authorityOrDepartment: ["Customs", "DGFT", "Pollution control authority if applicable", "Carrier/DG desk"],
        riskLevel: "high",
        notes: "Chemical shipments need classification, packaging, transport hazard and restricted-chemical checks before booking.",
    },
    {
        productCategory: "Electronics",
        hsCodePrefix: "84, 85",
        productSpecificDocuments: [
            "BIS registration/certificate where applicable",
            "WPC approval where wireless/radio equipment is involved",
            "Technical specification sheet",
            "Test report or conformity certificate where required",
        ],
        authorityOrDepartment: ["BIS", "WPC", "MeitY where applicable", "Customs", "DGFT"],
        riskLevel: "medium",
        notes: "Electronics may need safety, wireless, energy, labelling or e-waste compliance checks depending on product type.",
    },
    {
        productCategory: "Textiles",
        hsCodePrefix: "50, 52, 54, 55, 61, 62, 63",
        productSpecificDocuments: [
            "Certificate of origin",
            "Fibre composition certificate where required",
            "Inspection certificate where buyer or destination requires it",
            "Labelling and care instruction details where applicable",
        ],
        authorityOrDepartment: ["Textiles Committee where applicable", "Customs", "DGFT", "Export Promotion Council"],
        riskLevel: "medium",
        notes: "Textile shipments often need composition, origin, labelling and buyer-specific inspection documents.",
    },
    {
        productCategory: "Machinery",
        hsCodePrefix: "84, 85, 87",
        productSpecificDocuments: [
            "Technical catalogue/specification sheet",
            "Inspection certificate where required",
            "Warranty or installation documents where applicable",
            "Country-specific conformity documents where applicable",
        ],
        authorityOrDepartment: ["Customs", "DGFT", "BIS where applicable", "Destination standards authority"],
        riskLevel: "medium",
        notes: "Machinery checks depend on new/used status, technical standards, safety requirements and destination conformity rules.",
    },
];

const countrySpecificConditionalDocuments = {
    Kenya: ["Destination standards/conformity certificate where applicable", "Importer permit for regulated goods"],
    Tanzania: ["Destination inspection/conformity certificate where applicable", "Importer registration or permit for regulated goods"],
    Uganda: ["Destination standards certificate where applicable", "Regulatory import permit for controlled products"],
    Rwanda: ["Rwanda standards/conformity documents where applicable", "Importer-side regulatory approvals"],
    UAE: ["UAE/GCC conformity or municipality approval where applicable", "Halal certificate for applicable food products"],
    "Saudi Arabia": ["SABER/SASO conformity documents where applicable", "Arabic labelling and halal certificate where applicable"],
    Oman: ["GCC conformity certificate where applicable", "Importer permit for regulated goods"],
    Qatar: ["Qatar/GCC conformity documents where applicable", "Ministry approval for regulated goods"],
    China: ["GACC/CIQ registration where applicable", "Chinese labelling and product registration where applicable"],
};

const directions = [
    {
        direction: "export from India",
        requiredDocuments: commonExportDocuments,
        conditionalBase: [
            "Export licence if restricted",
            "Pre-shipment inspection certificate if required",
            "Product test report or certificate where buyer/destination requires it",
        ],
    },
    {
        direction: "import into India",
        requiredDocuments: commonImportDocuments,
        conditionalBase: [
            "Import licence if restricted",
            "BIS/FSSAI/CDSCO/WPC or other India-specific approval where applicable",
            "Country of origin declaration where preferential duty is claimed",
        ],
    },
];

const documentRules = focusCountries.flatMap((country) =>
    directions.flatMap(({ direction, requiredDocuments, conditionalBase }) =>
        productProfiles.map((profile) => ({
            country,
            direction,
            productCategory: profile.productCategory,
            hsCodePrefix: profile.hsCodePrefix,
            requiredDocuments,
            conditionalDocuments: [
                ...conditionalBase,
                ...profile.productSpecificDocuments,
                ...(countrySpecificConditionalDocuments[country] || []),
            ],
            productSpecificDocuments: profile.productSpecificDocuments,
            authorityOrDepartment: Array.from(
                new Set([...profile.authorityOrDepartment, "CHA / Customs Broker", "Authorised Dealer Bank"]),
            ),
            notes: `${profile.notes} ${countryNotes[country]}`,
            riskLevel: profile.riskLevel,
            lastUpdated,
            dataType: "sample/manual",
        })),
    ),
);

export { documentRules, focusCountries, productProfiles };
