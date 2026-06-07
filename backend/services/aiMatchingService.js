import Buyer from "../models/Buyer.js";

const normalize = (value = "") => value.toString().trim().toLowerCase();

const toWords = (items = []) =>
    items
        .flatMap((item) => normalize(item).split(/[\s,]+/))
        .filter(Boolean);

const SCORING_WEIGHTS = {
    country: 30,
    industry: 25,
    product: 35,
    tradeVolume: 10,
};

const scoreBuyerForProduct = (buyer, product) => {
    let weightedScore = 0;
    const reasons = [];

    const buyerCountry = normalize(buyer.country);
    const buyerIndustry = normalize(buyer.industry);
    const productCategory = normalize(product.category);
    const exportCountry = normalize(product.exportCountry);
    const targetCountries = (product.targetCountries || []).map(normalize);
    const productWords = new Set([
        ...toWords([product.name, product.category, product.hsCode, product.exportCountry]),
        ...toWords(product.tags || []),
        ...toWords(product.keywords || []),
    ]);
    const buyerWords = new Set([
        ...toWords([buyer.companyName, buyer.industry, buyer.country]),
        ...toWords(buyer.products || []),
    ]);

    if (targetCountries.includes(buyerCountry)) {
        weightedScore += SCORING_WEIGHTS.country;
        reasons.push(`Target country match: ${buyer.country}`);
    }

    if (buyerIndustry && productCategory && buyerIndustry.includes(productCategory)) {
        weightedScore += SCORING_WEIGHTS.industry;
        reasons.push(`Industry aligns with ${product.category}`);
    }

    let keywordHits = 0;
    productWords.forEach((word) => {
        if (word.length > 2 && buyerWords.has(word)) {
            keywordHits += 1;
        }
    });

    if (keywordHits) {
        const keywordScore = Math.min(keywordHits * 12, SCORING_WEIGHTS.product);
        weightedScore += keywordScore;
        reasons.push(`${keywordHits} keyword signal${keywordHits > 1 ? "s" : ""} matched`);
    }

    if (buyer.tradeVolume) {
        const volumeScore = Math.min(Math.log10(Number(buyer.tradeVolume) + 1) * 1.6, SCORING_WEIGHTS.tradeVolume);
        weightedScore += volumeScore;
        reasons.push("Trade volume signal found");
    } else if (buyer.verified) {
        weightedScore += 5;
        reasons.push("Verified buyer profile");
    }

    if (exportCountry && buyerCountry && exportCountry !== buyerCountry) {
        weightedScore += 4;
        reasons.push(`Cross-border export opportunity from ${product.exportCountry}`);
    }

    return {
        buyer,
        score: Math.min(Math.round(weightedScore), 98),
        scoring: SCORING_WEIGHTS,
        reasons: reasons.length ? reasons : ["General market fit based on buyer profile"],
    };
};

const getProductMatches = async (product, limit = 8) => {
    const productTerms = [
        product.name,
        product.category,
        product.hsCode,
        product.exportCountry,
        ...(product.tags || []),
        ...(product.keywords || []),
        ...(product.targetCountries || []),
    ].filter(Boolean);

    const query = productTerms.length
        ? {
              $or: productTerms.map((term) => ({
                  $or: [
                      { country: { $regex: term, $options: "i" } },
                      { industry: { $regex: term, $options: "i" } },
                      { products: { $regex: term, $options: "i" } },
                      { companyName: { $regex: term, $options: "i" } },
                  ],
              })),
          }
        : {};

    const buyers = await Buyer.find(query).limit(60);

    return buyers
        .map((buyer) => scoreBuyerForProduct(buyer, product))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

export { SCORING_WEIGHTS, getProductMatches, scoreBuyerForProduct };
