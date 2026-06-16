const communicationLastUpdated = "2026-06-16";

const communicationTemplateTypes = [
    "buyer-inquiry-reply",
    "supplier-inquiry-email",
    "product-quotation-email",
    "proforma-invoice-message",
    "payment-follow-up",
    "shipment-update",
    "document-submission-email",
    "sample-request-reply",
    "negotiation-message",
    "delay-notification",
    "buyer-verification-email",
    "supplier-verification-email",
];

const communicationDisclaimer =
    "These are sample trade communication templates. Review commercial, legal, product, payment, Incoterms and compliance details before sending. Do not share confidential documents until the buyer/supplier is verified.";

const templateBodies = {
    "buyer-inquiry-reply": {
        title: "Buyer inquiry reply",
        subject: "Re: Your inquiry for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nThank you for your inquiry regarding {{productName}} for {{country}}.\n\nWe can support the requested quantity of {{quantity}} subject to final specification, packaging, Incoterms and payment confirmation. Please share your company details, destination port/airport, required certification and target delivery timeline.\n\nOur tentative commercial basis can be discussed on {{incoterm}} with {{paymentTerm}}.\n\nRegards,\nTradeAI User",
    },
    "supplier-inquiry-email": {
        title: "Supplier inquiry email",
        subject: "Inquiry for {{productName}} supply",
        body:
            "Dear {{buyerOrSupplierName}},\n\nWe are evaluating suppliers for {{productName}} for trade with {{country}}.\n\nPlease share your product specification, MOQ, price indication, certifications, production capacity, lead time, packing details and export experience. Also confirm whether you can support {{quantity}} under {{incoterm}} terms.\n\nRegards,\nTradeAI User",
    },
    "product-quotation-email": {
        title: "Product quotation email",
        subject: "Quotation for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nPlease find our quotation summary for {{productName}}:\n\nQuantity: {{quantity}}\nIncoterm: {{incoterm}}\nPayment term: {{paymentTerm}}\nShipment mode: {{shipmentMode}}\nDestination/Country: {{country}}\n\nThis quotation is subject to final HS code, documentation, packaging, freight and compliance confirmation.\n\nRegards,\nTradeAI User",
    },
    "proforma-invoice-message": {
        title: "Proforma invoice message",
        subject: "Proforma Invoice for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nPlease find the proforma invoice details for {{productName}} as discussed.\n\nQuantity: {{quantity}}\nIncoterm: {{incoterm}}\nPayment term: {{paymentTerm}}\nShipment mode: {{shipmentMode}}\n\nKindly review the details and confirm company name, billing address, delivery address and bank/payment process before we proceed.\n\nRegards,\nTradeAI User",
    },
    "payment-follow-up": {
        title: "Payment follow-up",
        subject: "Payment follow-up for {{productName}} order",
        body:
            "Dear {{buyerOrSupplierName}},\n\nThis is a polite follow-up regarding the pending payment for {{productName}}.\n\nAs agreed, the payment term is {{paymentTerm}}. Please share the payment status or remittance reference so we can continue with the next shipment/document step.\n\nRegards,\nTradeAI User",
    },
    "shipment-update": {
        title: "Shipment update",
        subject: "Shipment update for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nThis is an update for the {{productName}} shipment to {{country}}.\n\nShipment mode: {{shipmentMode}}\nIncoterm: {{incoterm}}\nQuantity: {{quantity}}\n\nWe will share the transport document and related shipping details once available. Please keep your customs broker/import team ready for destination clearance.\n\nRegards,\nTradeAI User",
    },
    "document-submission-email": {
        title: "Document submission email",
        subject: "Trade documents for {{productName}} shipment",
        body:
            "Dear {{buyerOrSupplierName}},\n\nPlease find the trade documents for the {{productName}} shipment.\n\nKindly review invoice, packing list, transport document, certificate of origin and product-specific certificates where applicable. Please confirm if your customs broker requires any correction or additional document.\n\nRegards,\nTradeAI User",
    },
    "sample-request-reply": {
        title: "Sample request reply",
        subject: "Sample request for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nThank you for your sample request for {{productName}}.\n\nWe can arrange a sample shipment subject to sample quantity, courier/freight cost, destination requirements and payment confirmation. Please share consignee details, courier preference and any labelling or certificate requirement for {{country}}.\n\nRegards,\nTradeAI User",
    },
    "negotiation-message": {
        title: "Negotiation message",
        subject: "Commercial discussion for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nThank you for your feedback on the offer for {{productName}}.\n\nWe can review pricing based on final quantity, packaging, payment term, Incoterm and shipment mode. For {{quantity}}, please confirm your target price, delivery timeline and preferred payment structure so we can evaluate a workable proposal.\n\nRegards,\nTradeAI User",
    },
    "delay-notification": {
        title: "Delay notification",
        subject: "Shipment/document delay update for {{productName}}",
        body:
            "Dear {{buyerOrSupplierName}},\n\nWe would like to inform you of a delay related to the {{productName}} shipment.\n\nThe current delay is being reviewed with the logistics/documentation team. We will share the revised timeline and next action as soon as confirmed.\n\nRegards,\nTradeAI User",
    },
    "buyer-verification-email": {
        title: "Buyer verification email",
        subject: "Company verification request",
        body:
            "Dear {{buyerOrSupplierName}},\n\nBefore proceeding with the {{productName}} transaction, please share your company registration details, import licence where applicable, tax registration, buyer references and official purchase order.\n\nThis helps us complete internal buyer verification and agree safe payment/document terms.\n\nRegards,\nTradeAI User",
    },
    "supplier-verification-email": {
        title: "Supplier verification email",
        subject: "Supplier verification request",
        body:
            "Dear {{buyerOrSupplierName}},\n\nBefore proceeding with sourcing of {{productName}}, please share your company registration, export licence where applicable, factory/trading profile, product certificates, bank account details matching company name and recent shipment references.\n\nRegards,\nTradeAI User",
    },
};

const communicationTemplates = communicationTemplateTypes.map((templateType) => ({
    templateType,
    title: templateBodies[templateType].title,
    subject: templateBodies[templateType].subject,
    body: templateBodies[templateType].body,
    userRoles: templateType.includes("supplier") ? ["importer"] : ["exporter", "importer"],
    tones: ["formal", "simple", "professional"],
    countries: ["Kenya", "Tanzania", "Uganda", "Rwanda", "UAE", "Saudi Arabia", "Oman", "Qatar", "China"],
    productCategories: ["Food/agri", "Textiles", "Electronics", "Machinery", "Chemicals", "Pharma", "General goods"],
    dataType: "sample/manual",
    lastUpdated: communicationLastUpdated,
}));

export {
    communicationDisclaimer,
    communicationLastUpdated,
    communicationTemplateTypes,
    communicationTemplates,
};
