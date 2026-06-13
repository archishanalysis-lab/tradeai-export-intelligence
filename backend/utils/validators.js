import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB id");

const csvOrArray = z.preprocess((value) => {
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }

    return value;
}, z.array(z.string()).default([]));

const optionalCsvOrArray = z.preprocess((value) => {
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }

    return value;
}, z.array(z.string()).optional());

const paginationQuery = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().trim().max(120).optional(),
    sort: z.string().trim().max(40).optional(),
});
const publicRegistrationRoles = ["explorer", "exporter", "importer", "consultant", "sme"];

const authRegisterSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(120),
        company: z.string().trim().max(120).optional().default(""),
        role: z.enum(publicRegistrationRoles),
        password: z.string().min(8).max(128),
    }),
});

const authLoginSchema = z.object({
    body: z.object({
        email: z.string().trim().email().max(120),
        password: z.string().min(1).max(128),
    }),
});

const authForgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().trim().email().max(120),
    }),
});

const contactRoleTypes = [
    "exporter",
    "importer",
    "consultant",
    "investor",
    "mentor",
    "technical reviewer",
    "other",
];

const contactFeedbackTypes = [
    "UI",
    "Business model",
    "MVP features",
    "Technical review",
    "Pricing",
    "Market opportunity",
    "Partnership",
];

const contactPriorities = [
    "High priority",
    "Medium priority",
    "Low priority",
    "Very useful",
    "Needs work",
];

const contactStatuses = ["new", "reviewed", "action_required", "closed"];

const optionalEnumOrEmpty = (values) =>
    z.preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        z.enum(values).optional(),
    ).transform((value) => value || "");

const contactCreateSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(160),
        company: z.string().trim().max(160).optional().default(""),
        roleType: optionalEnumOrEmpty(contactRoleTypes),
        feedbackType: optionalEnumOrEmpty(contactFeedbackTypes),
        priority: optionalEnumOrEmpty(contactPriorities),
        subject: z.string().trim().max(180).optional().default("TradeAI stakeholder feedback"),
        message: z.string().trim().min(10).max(3000),
        source: z.string().trim().max(120).optional().default("mvp-feedback"),
        interest: z.string().trim().max(120).optional().default(""),
    }),
});

const contactFeedbackQuerySchema = z.object({
    query: paginationQuery.extend({
        status: z.enum(contactStatuses).optional(),
        feedbackType: z.enum(contactFeedbackTypes).optional(),
        priority: z.enum(contactPriorities).optional(),
    }),
});

const contactFeedbackStatusSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(contactStatuses),
        adminNotes: z.string().trim().max(2000).optional().default(""),
    }),
});

const reportRequestStatuses = ["new", "reviewed", "action_required", "closed"];
const reportRequestPriorities = ["High priority", "Medium priority", "Low priority"];

const reportRequestCreateSchema = z
    .object({
        body: z.object({
            name: z.string().trim().min(2).max(120),
            email: z.string().trim().email().max(160),
            company: z.string().trim().max(160).optional().default(""),
            roleType: optionalEnumOrEmpty(contactRoleTypes),
            productName: z.string().trim().max(180).optional().default(""),
            hsCode: z.string().trim().max(20).optional().default(""),
            originCountry: z.string().trim().min(2).max(80),
            targetCountry: z.string().trim().max(120).optional().default(""),
            businessType: z.string().trim().max(80).optional().default(""),
            reportObjective: z.string().trim().max(180).optional().default(""),
            message: z.string().trim().max(2500).optional().default(""),
            source: z.string().trim().max(120).optional().default("export-opportunity-report"),
            priority: optionalEnumOrEmpty(reportRequestPriorities),
        }),
    })
    .refine((data) => Boolean(data.body.productName || data.body.hsCode), {
        message: "Product name or HS code is required",
        path: ["body", "productName"],
    })
    .refine((data) => Boolean(data.body.targetCountry || data.body.reportObjective), {
        message: "Target country or report objective is required",
        path: ["body", "targetCountry"],
    });

const reportRequestQuerySchema = z.object({
    query: paginationQuery.extend({
        status: z.enum(reportRequestStatuses).optional(),
        priority: z.enum(reportRequestPriorities).optional(),
    }),
});

const reportRequestStatusSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(reportRequestStatuses),
        adminNotes: z.string().trim().max(2000).optional().default(""),
    }),
});

const marketplaceIntroRequestTypes = [
    "supplier_intro",
    "buyer_intro",
    "importer_intro",
    "product_inquiry",
    "company_profile_intro",
    "partnership",
    "other",
];

const marketplaceIntroTargetTypes = ["company", "supplier", "importer", "product", "buyer", "unknown"];
const marketplaceIntroStatuses = ["new", "reviewed", "action_required", "contacted", "closed"];
const marketplaceIntroPriorities = ["High priority", "Medium priority", "Low priority"];

const marketplaceIntroCreateSchema = z
    .object({
        body: z.object({
            name: z.string().trim().min(2).max(120),
            email: z.string().trim().email().max(160),
            company: z.string().trim().max(160).optional().default(""),
            roleType: optionalEnumOrEmpty(contactRoleTypes),
            requestType: z.enum(marketplaceIntroRequestTypes),
            targetType: z.enum(marketplaceIntroTargetTypes).optional().default("unknown"),
            targetId: z.string().trim().max(120).optional().default(""),
            targetSlug: z.string().trim().max(160).optional().default(""),
            targetName: z.string().trim().max(180).optional().default(""),
            country: z.string().trim().max(80).optional().default(""),
            industry: z.string().trim().max(120).optional().default(""),
            product: z.string().trim().max(180).optional().default(""),
            message: z.string().trim().max(2500).optional().default(""),
            source: z.string().trim().max(120).optional().default("marketplace"),
            priority: optionalEnumOrEmpty(marketplaceIntroPriorities),
        }),
    })
    .refine((data) => data.body.targetType !== "unknown" || Boolean(data.body.targetName), {
        message: "Target type or target name is required",
        path: ["body", "targetName"],
    })
    .refine((data) => Boolean(data.body.message || data.body.product), {
        message: "Message or product interest is required",
        path: ["body", "message"],
    });

const marketplaceIntroQuerySchema = z.object({
    query: paginationQuery.extend({
        status: z.enum(marketplaceIntroStatuses).optional(),
        priority: z.enum(marketplaceIntroPriorities).optional(),
        requestType: z.enum(marketplaceIntroRequestTypes).optional(),
        targetType: z.enum(marketplaceIntroTargetTypes).optional(),
    }),
});

const marketplaceIntroStatusSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(marketplaceIntroStatuses),
        adminNotes: z.string().trim().max(2000).optional().default(""),
    }),
});

const buyerBody = z.object({
    companyName: z.string().trim().min(2).max(160),
    country: z.string().trim().min(2).max(80),
    industry: z.string().trim().min(2).max(120),
    products: csvOrArray,
    website: z.string().trim().max(240).optional().default(""),
    contactEmail: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
    verified: z.coerce.boolean().optional(),
    tradeVolume: z.coerce.number().min(0).optional(),
});

const buyerCreateSchema = z.object({ body: buyerBody });
const buyerUpdateSchema = z.object({
    params: z.object({ id: objectId }),
    body: buyerBody.partial(),
});
const buyerParamsSchema = z.object({ params: z.object({ id: objectId }) });
const buyerQuerySchema = z
    .object({
        query: paginationQuery.extend({
            country: z.string().trim().max(80).optional(),
            industry: z.string().trim().max(120).optional(),
            verified: z.enum(["true", "false"]).optional(),
            tradeVolumeMin: z.coerce.number().min(0).optional(),
            tradeVolumeMax: z.coerce.number().min(0).optional(),
        }),
    })
    .refine(
        (data) =>
            data.query.tradeVolumeMin === undefined ||
            data.query.tradeVolumeMax === undefined ||
            data.query.tradeVolumeMax >= data.query.tradeVolumeMin,
        {
            message: "tradeVolumeMax must be greater than or equal to tradeVolumeMin",
            path: ["query", "tradeVolumeMax"],
        },
    );

const currencyCode = z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code");

const productPriceSchema = z
    .object({
        amount: z.coerce.number().min(0).optional().default(0),
        currency: currencyCode.optional().default("USD"),
    })
    .optional();

const normalizeProductBody = (body) => {
    const { priceAmount, currency, ...rest } = body;

    return {
        ...rest,
        price: {
            amount: Number(body.price?.amount ?? priceAmount ?? 0),
            currency: body.price?.currency || currency || "USD",
        },
    };
};

const productBodyFields = z.object({
    name: z.string().trim().min(2).max(180),
    description: z.string().trim().max(1500).optional().default(""),
    category: z.string().trim().min(2).max(120),
    hsCode: z.string().trim().max(20).optional().default(""),
    imageUrl: z.string().trim().max(500).optional().default(""),
    moq: z.coerce.number().min(0).optional().default(0),
    price: productPriceSchema,
    priceAmount: z.coerce.number().min(0).optional(),
    currency: currencyCode.optional(),
    exportCountry: z.string().trim().max(80).optional().default(""),
    availability: z.enum(["available", "limited", "on_request", "out_of_stock"]).optional().default("available"),
    targetCountries: csvOrArray,
    tags: csvOrArray,
    keywords: csvOrArray,
});

const productBody = productBodyFields.transform(normalizeProductBody);

const productUpdateBody = z.object({
    name: z.string().trim().min(2).max(180).optional(),
    description: z.string().trim().max(1500).optional(),
    category: z.string().trim().min(2).max(120).optional(),
    hsCode: z.string().trim().max(20).optional(),
    imageUrl: z.string().trim().max(500).optional(),
    moq: z.coerce.number().min(0).optional(),
    price: productPriceSchema,
    priceAmount: z.coerce.number().min(0).optional(),
    currency: currencyCode.optional(),
    exportCountry: z.string().trim().max(80).optional(),
    availability: z.enum(["available", "limited", "on_request", "out_of_stock"]).optional(),
    targetCountries: optionalCsvOrArray,
    tags: optionalCsvOrArray,
    keywords: optionalCsvOrArray,
}).transform((body) => {
    const hasPriceInput =
        body.price !== undefined || body.priceAmount !== undefined || body.currency !== undefined;

    if (!hasPriceInput) {
        const { priceAmount, currency, ...rest } = body;
        return rest;
    }

    return normalizeProductBody(body);
});

const productRangeQuery = paginationQuery.extend({
    category: z.string().trim().max(120).optional(),
    availability: z.enum(["available", "limited", "on_request", "out_of_stock"]).optional(),
    exportCountry: z.string().trim().max(80).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    moqMin: z.coerce.number().min(0).optional(),
    moqMax: z.coerce.number().min(0).optional(),
});

const productCreateSchema = z.object({ body: productBody });
const productUpdateSchema = z.object({
    params: z.object({ id: objectId }),
    body: productUpdateBody,
});
const productParamsSchema = z.object({ params: z.object({ id: objectId }) });
const productQuerySchema = z
    .object({
        query: productRangeQuery,
    })
    .refine(
        (data) =>
            data.query.priceMin === undefined ||
            data.query.priceMax === undefined ||
            data.query.priceMax >= data.query.priceMin,
        {
            message: "priceMax must be greater than or equal to priceMin",
            path: ["query", "priceMax"],
        },
    )
    .refine(
        (data) =>
            data.query.moqMin === undefined ||
            data.query.moqMax === undefined ||
            data.query.moqMax >= data.query.moqMin,
        {
            message: "moqMax must be greater than or equal to moqMin",
            path: ["query", "moqMax"],
        },
    );

const inquiryCreateSchema = z.object({
    body: z.object({
        buyer: objectId.optional(),
        product: objectId,
        buyerName: z.string().trim().max(120).optional().default(""),
        buyerEmail: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
        companyName: z.string().trim().max(160).optional().default(""),
        message: z.string().trim().max(2500).optional().default(""),
        exporterEmail: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
    }),
});

const inquiryStatusSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(["pending", "accepted", "rejected", "completed"]),
    }),
});

const inquiryMessageSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        sender: z.enum(["buyer", "exporter", "system"]).optional(),
        message: z.string().trim().min(1).max(2500),
    }),
});

const dealStages = [
    "lead_generated",
    "contacted",
    "qualified",
    "quotation_sent",
    "negotiation",
    "won",
    "completed",
    "lost",
];

const dealBody = z.object({
    title: z.string().trim().min(2).max(180),
    buyer: objectId.optional(),
    product: objectId.optional(),
    inquiry: objectId.optional(),
    companyName: z.string().trim().max(160).optional().default(""),
    contactName: z.string().trim().max(120).optional().default(""),
    contactEmail: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
    country: z.string().trim().max(80).optional().default(""),
    value: z.coerce.number().min(0).optional().default(0),
    currency: currencyCode.optional().default("USD"),
    stage: z.enum(dealStages).optional().default("lead_generated"),
    probability: z.coerce.number().min(0).max(100).optional().default(20),
    nextAction: z.string().trim().max(240).optional().default(""),
    expectedCloseDate: z.coerce.date().optional(),
    notes: z.string().trim().max(2500).optional().default(""),
});

const dealCreateSchema = z.object({ body: dealBody });
const dealUpdateSchema = z.object({
    params: z.object({ id: objectId }),
    body: dealBody.partial(),
});
const dealParamsSchema = z.object({ params: z.object({ id: objectId }) });
const dealQuerySchema = z.object({
    query: paginationQuery.extend({
        stage: z.enum(dealStages).optional(),
    }),
});

const hsCodeQuery = z
    .string()
    .trim()
    .regex(/^(?:\d{2}|\d{4}|\d{6}|\d{8}|\d{10})$/, "HS code must be 2, 4, 6, 8, or 10 digits");

const comtradeCountryCode = z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Country code must be a 1-3 digit UN Comtrade code");

const tradeDataQuerySchema = z.object({
    query: paginationQuery.extend({
        hsCode: hsCodeQuery.optional(),
        q: z.string().trim().min(2).max(120).optional(),
        reporterCode: comtradeCountryCode.optional().default("842"),
        partnerCode: comtradeCountryCode.optional().default("0"),
        flowCode: z.enum(["M", "X"]).optional().default("X"),
        period: z
            .string()
            .trim()
            .regex(/^\d{4}(?:\d{2})?$/, "Period must be YYYY or YYYYMM")
            .optional(),
        limit: z.coerce.number().int().positive().max(500).optional().default(100),
    }),
});

const copilotAskSchema = z.object({
    body: z.object({
        prompt: z.string().trim().min(3).max(2000),
        filters: z
            .record(z.string(), z.union([z.string().max(160), z.number(), z.boolean()]))
            .optional()
            .default({}),
    }),
});

export {
    authForgotPasswordSchema,
    authLoginSchema,
    authRegisterSchema,
    contactCreateSchema,
    contactFeedbackQuerySchema,
    contactFeedbackStatusSchema,
    buyerCreateSchema,
    buyerParamsSchema,
    buyerQuerySchema,
    buyerUpdateSchema,
    copilotAskSchema,
    dealCreateSchema,
    dealParamsSchema,
    dealQuerySchema,
    dealUpdateSchema,
    inquiryCreateSchema,
    inquiryMessageSchema,
    inquiryStatusSchema,
    marketplaceIntroCreateSchema,
    marketplaceIntroQuerySchema,
    marketplaceIntroStatusSchema,
    productCreateSchema,
    productParamsSchema,
    productQuerySchema,
    productUpdateSchema,
    reportRequestCreateSchema,
    reportRequestQuerySchema,
    reportRequestStatusSchema,
    tradeDataQuerySchema,
};
