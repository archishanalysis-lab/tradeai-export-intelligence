(function () {
  window.TradeAI = window.TradeAI || {};

  window.TradeAI.corridorData = {
    kenya: {
      country: "Kenya",
      corridor: "India to Kenya",
      region: "East Africa",
      slug: "kenya",
      title: "India-Kenya Export Intelligence",
      summary:
        "Kenya is a practical East Africa entry market for Indian exporters testing food products, pharma, packaging and light machinery opportunities through Nairobi and Mombasa-linked distribution.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Spices and food products", "Pharmaceuticals", "Packaging materials", "Textiles", "Light machinery"],
      hsCodes: [
        { code: "0910", label: "Spices and turmeric categories" },
        { code: "3004", label: "Medicaments and pharma products" },
        { code: "3923", label: "Plastic packaging articles" },
      ],
      challenges: ["Importer verification", "Landed-cost clarity", "Documentation consistency", "Regional distributor selection"],
      workflow: ["Compare product-country fit", "Shortlist importer segments", "Validate HS code and documents", "Prepare buyer-ready quote"],
    },
    tanzania: {
      country: "Tanzania",
      corridor: "India to Tanzania",
      region: "East Africa",
      slug: "tanzania",
      title: "India-Tanzania Export Intelligence",
      summary:
        "Tanzania offers Indian exporters a gateway for agriculture-linked goods, pharma, textiles and machinery, with Dar es Salaam supporting broader East Africa movement.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Rice and food products", "Pharmaceuticals", "Textiles", "Agri inputs", "Machinery"],
      hsCodes: [
        { code: "1006", label: "Rice" },
        { code: "3004", label: "Medicaments" },
        { code: "8437", label: "Agri processing machinery" },
      ],
      challenges: ["Port timing", "Distributor reliability", "Price-sensitive demand", "Document readiness"],
      workflow: ["Review demand signals", "Estimate landed cost", "Validate buyer type", "Prepare compliance checklist"],
    },
    uganda: {
      country: "Uganda",
      corridor: "India to Uganda",
      region: "East Africa",
      slug: "uganda",
      title: "India-Uganda Export Intelligence",
      summary:
        "Uganda is an inland East Africa opportunity for exporters comparing pharma, packaging, textiles and FMCG demand with route and distributor planning.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Pharma", "Packaging", "Textiles", "FMCG", "Light machinery"],
      hsCodes: [
        { code: "3004", label: "Medicaments" },
        { code: "3923", label: "Packaging articles" },
        { code: "6109", label: "Textile garments" },
      ],
      challenges: ["Inland logistics", "Buyer reliability", "Payment terms", "Route planning"],
      workflow: ["Check route feasibility", "Compare importer categories", "Validate documents", "Plan staged outreach"],
    },
    rwanda: {
      country: "Rwanda",
      corridor: "India to Rwanda",
      region: "East Africa",
      slug: "rwanda",
      title: "India-Rwanda Export Intelligence",
      summary:
        "Rwanda is a focused market for exporters evaluating packaged food, pharma, light manufacturing inputs and SME distribution opportunities.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Packaged foods", "Pharma", "Packaging", "Light machinery", "Consumer goods"],
      hsCodes: [
        { code: "1905", label: "Prepared food products" },
        { code: "3004", label: "Medicaments" },
        { code: "8422", label: "Packing machinery" },
      ],
      challenges: ["Smaller market sizing", "Distributor concentration", "Documentation accuracy", "Price competitiveness"],
      workflow: ["Test product fit", "Identify distributor profiles", "Review HS code fit", "Prepare sample report"],
    },
    uae: {
      country: "UAE",
      corridor: "India to UAE",
      region: "Gulf / GCC",
      slug: "uae",
      title: "India-UAE Trade Intelligence",
      summary:
        "UAE is a high-priority Gulf corridor for premium food, spices, textiles, jewellery, engineering goods and re-export oriented buyer discovery.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Spices", "Packaged foods", "Textiles", "Jewellery", "Engineering goods"],
      hsCodes: [
        { code: "0910", label: "Spices and turmeric categories" },
        { code: "7113", label: "Jewellery articles" },
        { code: "6109", label: "Textile garments" },
      ],
      challenges: ["Premium positioning", "Certification expectations", "Buyer segmentation", "Re-export channel clarity"],
      workflow: ["Compare buyer segments", "Check product readiness", "Validate HS code", "Request buyer intro or report"],
    },
    "saudi-arabia": {
      country: "Saudi Arabia",
      corridor: "India to Saudi Arabia",
      region: "Gulf / GCC",
      slug: "saudi-arabia",
      title: "India-Saudi Arabia Market Intelligence",
      summary:
        "Saudi Arabia is useful for exporters exploring food, industrial materials, construction-linked goods and premium distributor channels.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Food products", "Industrial materials", "Construction supplies", "Textiles", "Chemicals"],
      hsCodes: [
        { code: "2106", label: "Prepared food products" },
        { code: "7308", label: "Iron or steel structures" },
        { code: "3824", label: "Chemical preparations" },
      ],
      challenges: ["Compliance review", "Arabic labeling", "Distributor validation", "Competitive pricing"],
      workflow: ["Review sector fit", "Check compliance needs", "Shortlist buyer categories", "Prepare export opportunity report"],
    },
    oman: {
      country: "Oman",
      corridor: "India to Oman",
      region: "Gulf / GCC",
      slug: "oman",
      title: "India-Oman Export Intelligence",
      summary:
        "Oman is a focused Gulf market for food products, chemicals, construction materials, machinery and hospitality procurement paths.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Food products", "Chemicals", "Construction materials", "Machinery", "Hospitality supplies"],
      hsCodes: [
        { code: "1905", label: "Bakery and prepared foods" },
        { code: "3824", label: "Chemical preparations" },
        { code: "8438", label: "Food processing machinery" },
      ],
      challenges: ["Focused market size", "Distributor fit", "Documentation quality", "Repeat-order validation"],
      workflow: ["Check category demand", "Compare distributor paths", "Validate documents", "Plan first outreach"],
    },
    qatar: {
      country: "Qatar",
      corridor: "India to Qatar",
      region: "Gulf / GCC",
      slug: "qatar",
      title: "India-Qatar Export Intelligence",
      summary:
        "Qatar is a premium Gulf corridor for food products, construction materials, machinery and hospitality-linked buyer discovery.",
      sourceLabel: "Sample corridor intelligence for MVP preview",
      products: ["Food products", "Construction materials", "Machinery", "Hospitality supplies", "Specialty ingredients"],
      hsCodes: [
        { code: "2106", label: "Prepared food products" },
        { code: "6810", label: "Cement and construction articles" },
        { code: "8438", label: "Food processing machinery" },
      ],
      challenges: ["Premium positioning", "Certification expectations", "Buyer validation", "Delivery reliability"],
      workflow: ["Compare premium segments", "Check product certification", "Review buyer fit", "Generate sample report"],
    },
    china: {
      country: "China",
      corridor: "India-China",
      region: "Sourcing / Import intelligence",
      slug: "china",
      title: "India-China Sourcing Intelligence",
      summary:
        "China supports importer-side sourcing intelligence, supplier comparison, price benchmarking, competitor tracking and import dependency analysis.",
      sourceLabel: "Sample sourcing intelligence for MVP preview",
      products: ["Electronics", "Machinery", "Chemicals", "Auto components", "Industrial inputs"],
      hsCodes: [
        { code: "8542", label: "Electronic integrated circuits" },
        { code: "8479", label: "Industrial machinery" },
        { code: "8708", label: "Auto parts" },
      ],
      challenges: ["Supplier reliability", "Quality control", "Price benchmarking", "Import dependency risk"],
      workflow: ["Compare supplier categories", "Benchmark prices", "Check compliance and quality needs", "Prepare sourcing shortlist"],
    },
  };
})();
