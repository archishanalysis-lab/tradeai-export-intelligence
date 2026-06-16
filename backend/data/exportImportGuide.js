const lastUpdated = "2026-06-16";

const exportImportProcessGuide = {
    dataType: "manual",
    lastUpdated,
    iecBasics: {
        title: "IEC and DGFT basics",
        whatIsIEC:
            "IEC means Importer Exporter Code. It is a 10-digit business identification number issued by DGFT and is normally required before an Indian business starts import or export activities.",
        whoNeedsIEC: [
            "Indian businesses or individuals importing goods into India for commercial use.",
            "Indian exporters sending goods or services outside India where IEC is required by bank, customs or DGFT workflow.",
            "SMEs, merchants, manufacturers, traders and service exporters planning regular cross-border trade.",
        ],
        howToApply: [
            "Create or sign in to the DGFT portal using business PAN and contact details.",
            "Open the IEC application service and fill business, proprietor/partner/director and bank details.",
            "Upload or validate the required identity, address and bank documents.",
            "Pay the prescribed DGFT fee and submit the application.",
            "Download the e-IEC after approval or successful system processing.",
        ],
        documentsNeeded: [
            "PAN of the individual or business entity.",
            "Identity and address proof of proprietor, partner or authorised signatory.",
            "Business address proof such as electricity bill, rent agreement or ownership document.",
            "Cancelled cheque or bank certificate for the current account.",
            "Business registration details where applicable, such as GST, partnership deed, LLP/CIN or shop registration.",
            "Mobile number and email that can receive OTPs and DGFT updates.",
        ],
        dgftBasics: [
            "DGFT manages IEC, Foreign Trade Policy, authorisations, export promotion schemes and trade notices.",
            "IEC is linked to PAN and should be kept updated when business address, bank or signatory details change.",
            "Some products may need additional licences, certificates or registration even when IEC is available.",
        ],
    },
    exportSteps: [
        {
            step: 1,
            title: "Select product and market",
            details:
                "Shortlist the product, buyer country and intended use. Check whether the product has demand, restrictions or special documentation in the destination market.",
        },
        {
            step: 2,
            title: "Confirm HS code and export eligibility",
            details:
                "Identify the likely HS code and verify if the item is free, restricted or prohibited for export. Final classification should be checked with a CHA or customs expert.",
        },
        {
            step: 3,
            title: "Prepare quotation and Incoterms",
            details:
                "Calculate product cost, packing, inland transport, freight, insurance, duties where applicable and margin. Quote using a clear Incoterm such as EXW, FOB, CIF or DAP.",
        },
        {
            step: 4,
            title: "Agree payment and buyer checks",
            details:
                "For a new buyer, prefer safer payment terms such as advance, letter of credit or milestone payment. Avoid high credit exposure without due diligence.",
        },
        {
            step: 5,
            title: "Arrange export documents",
            details:
                "Prepare commercial invoice, packing list, purchase order, shipping bill, transport document and product-specific certificates.",
        },
        {
            step: 6,
            title: "Ship and complete customs clearance",
            details:
                "Work with a freight forwarder or CHA for booking, customs filing, examination if any, let export order and shipment tracking.",
        },
        {
            step: 7,
            title: "Close payment and records",
            details:
                "Track buyer payment, bank realisation, e-BRC where applicable, GST/export incentive records and post-shipment documents.",
        },
    ],
    importSteps: [
        {
            step: 1,
            title: "Select product and supplier",
            details:
                "Check supplier credibility, product specifications, samples, quality standards and whether the product is allowed for import into India.",
        },
        {
            step: 2,
            title: "Confirm HS code, duty and restrictions",
            details:
                "Verify likely HS code, basic customs duty, IGST, social welfare surcharge and any BIS, FSSAI, CDSCO or other product-specific requirement.",
        },
        {
            step: 3,
            title: "Agree Incoterms and payment",
            details:
                "Understand whether the seller or buyer handles freight, insurance and local charges. Use safer payment terms for new suppliers.",
        },
        {
            step: 4,
            title: "Arrange shipment documents",
            details:
                "Collect commercial invoice, packing list, bill of lading or airway bill, certificate of origin and product certificates before customs filing.",
        },
        {
            step: 5,
            title: "File bill of entry and clear customs",
            details:
                "Use a CHA for bill of entry, duty payment, assessment, examination if required and out-of-charge clearance.",
        },
        {
            step: 6,
            title: "Receive goods and reconcile costs",
            details:
                "Track final landed cost, warehouse receipt, quality inspection, vendor payment and accounting records.",
        },
    ],
    beginnerChecklist: [
        { title: "Select product", description: "Choose a product with known specifications, packaging and buyer use case." },
        { title: "Find HS code", description: "Search likely HS category and verify final classification with a customs expert or CHA." },
        { title: "Get IEC", description: "Apply for IEC on DGFT before commercial import/export activity." },
        { title: "Check restrictions", description: "Confirm whether the product is free, restricted, prohibited or needs licences/certificates." },
        { title: "Identify target country", description: "Check demand, standards, buyer expectations and shipment practicality." },
        { title: "Understand duty/compliance", description: "Estimate duty, taxes and compliance using official sources or expert help." },
        { title: "Prepare quotation", description: "Include product cost, packing, inland logistics, freight, insurance, bank charges and margin." },
        { title: "Choose Incoterms", description: "Use a clear Incoterm so responsibilities and costs are not misunderstood." },
        { title: "Arrange documents", description: "Prepare invoice, packing list, shipping documents and product-specific certificates." },
        { title: "Book shipment", description: "Coordinate with freight forwarder for route, container/air booking and tracking." },
        { title: "Complete customs clearance", description: "File shipping bill or bill of entry and complete customs formalities." },
        { title: "Receive/make payment", description: "Use bank-compliant payment channels and keep documents for realisation/remittance." },
        { title: "Track shipment", description: "Monitor cargo movement, delivery timeline, exceptions and final document closure." },
    ],
    commonMistakes: [
        "Starting with a buyer or supplier before checking IEC, HS code, restrictions and basic compliance.",
        "Guessing the HS code and using it in documents without expert verification.",
        "Quoting only product price and forgetting freight, insurance, duty, bank charges, packaging and local handling.",
        "Using risky payment terms with a new buyer or supplier without credit checks.",
        "Assuming all countries accept the same documents, labels, packaging or certificates.",
        "Booking shipment before confirming product-specific certificates or inspection requirements.",
        "Treating online sample guidance as final legal, customs, tax or banking advice.",
    ],
    usefulDepartments: [
        {
            name: "DGFT",
            whenToUse: "IEC, Foreign Trade Policy, licences, authorisations, trade notices and exporter profile updates.",
            websiteLabel: "dgft.gov.in",
        },
        {
            name: "Customs / ICEGATE",
            whenToUse: "Shipping bill, bill of entry, customs duty, assessment, clearance and customs status.",
            websiteLabel: "icegate.gov.in",
        },
        {
            name: "CHA / Customs Broker",
            whenToUse: "HS verification, customs filing, clearance documentation and port-level process guidance.",
            websiteLabel: "Consult a licensed CHA",
        },
        {
            name: "Freight Forwarder",
            whenToUse: "Freight quote, booking, routing, cargo pickup, insurance coordination and shipment tracking.",
            websiteLabel: "Use a reliable forwarder",
        },
        {
            name: "Bank / Authorised Dealer Bank",
            whenToUse: "Export realisation, import remittance, letter of credit, bank charges and FEMA-compliant payment flow.",
            websiteLabel: "Speak to your AD bank",
        },
        {
            name: "Export Promotion Council / FIEO",
            whenToUse: "Market guidance, member support, trade fairs, certificates and product-sector export help.",
            websiteLabel: "Sector council or fieo.org",
        },
    ],
    disclaimer:
        "This beginner guide is educational and manually curated for TradeAI users. Verify IEC, HS classification, duty, restrictions, banking, customs and product compliance with DGFT, Customs, your bank, a CHA, freight forwarder or qualified professional before acting. This is not legal, tax, customs, banking or financial advice.",
};

export { exportImportProcessGuide };
