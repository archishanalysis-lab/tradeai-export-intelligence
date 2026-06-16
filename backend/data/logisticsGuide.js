const logisticsLastUpdated = "2026-06-16";

const logisticsDisclaimer =
    "Logistics guidance is sample/manual planning information only. Transit times, routes, charges and operational feasibility must be confirmed with a freight forwarder, carrier, CHA/customs broker, insurer and destination agent before shipment. TradeAI does not provide live freight rates.";

const logisticsCountries = [
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

const beginnerLogisticsEducation = [
    {
        title: "FCL vs LCL",
        description: "FCL means a full container booked for one shipper. LCL means cargo shares container space with other shippers and is useful for smaller loads.",
    },
    {
        title: "Freight forwarder role",
        description: "A freight forwarder coordinates booking, pickup, carrier routing, cargo handover, documents, tracking and destination agent coordination.",
    },
    {
        title: "CHA role",
        description: "A CHA/customs broker handles customs filing, document submission, assessment support and clearance coordination where required.",
    },
    {
        title: "Demurrage and detention",
        description: "Demurrage is delay cost at port/CFS. Detention is delay cost for keeping container equipment beyond free time.",
    },
    {
        title: "Insurance",
        description: "Cargo insurance protects against selected transit risks. Coverage, exclusions and insured value should be agreed before dispatch.",
    },
    {
        title: "Port charges",
        description: "Port, terminal, CFS, documentation, handling and delivery order charges can affect landed cost beyond freight alone.",
    },
];

const commonFreightDocuments = [
    "Commercial Invoice",
    "Packing List",
    "Shipping Bill / Bill of Entry as applicable",
    "Bill of Lading / Airway Bill",
    "Certificate of Origin where applicable",
    "Insurance Certificate where applicable",
    "Product-specific certificates where applicable",
];

const commonCharges = [
    "Pickup and inland transport",
    "Terminal/port handling charges",
    "Freight charges",
    "Documentation charges",
    "Customs clearance/CHA charges",
    "Insurance premium",
    "Destination handling and delivery charges",
    "Demurrage/detention if delays occur",
];

const routeProfiles = [
    {
        destinationCountry: "Kenya",
        commonPorts: ["Mombasa"],
        commonAirports: ["Nairobi Jomo Kenyatta International Airport"],
        seaRouteNotes: "India to Mombasa is a common East Africa sea route. Inland delivery depends on buyer location and destination agent coordination.",
        airRouteNotes: "Air cargo to Nairobi is suitable for samples, urgent parts, pharma or higher-value goods.",
        estimatedTransitTimeRange: "Sea: 14-28 days; Air: 2-7 days",
        fclLclSuitability: "LCL for samples/small shipments; FCL for repeat or bulk cargo to Kenya.",
        riskNotes: ["Plan destination clearance with Kenyan importer.", "Check port free time and inland delivery route before quoting."],
    },
    {
        destinationCountry: "Tanzania",
        commonPorts: ["Dar es Salaam"],
        commonAirports: ["Dar es Salaam Julius Nyerere International Airport"],
        seaRouteNotes: "Dar es Salaam is the primary sea gateway. Inland routing may add time and documentation coordination.",
        airRouteNotes: "Air is useful for urgent samples, pharma, electronics and small high-value consignments.",
        estimatedTransitTimeRange: "Sea: 16-32 days; Air: 2-7 days",
        fclLclSuitability: "LCL for early shipments; FCL for predictable volume and lower per-unit freight.",
        riskNotes: ["Destination inspection or standards documents can affect release.", "Confirm local charges with destination agent."],
    },
    {
        destinationCountry: "Uganda",
        commonPorts: ["Mombasa via inland transit", "Dar es Salaam via inland transit"],
        commonAirports: ["Entebbe International Airport"],
        seaRouteNotes: "Uganda is landlocked, so sea shipments move via Mombasa or Dar es Salaam plus inland transit.",
        airRouteNotes: "Air cargo to Entebbe is useful when inland transit time is too long for the product.",
        estimatedTransitTimeRange: "Sea + inland: 22-42 days; Air: 3-8 days",
        fclLclSuitability: "LCL can work for small shipments, but inland consolidation/deconsolidation must be planned carefully.",
        riskNotes: ["Inland transit adds cost, documentation and delay risk.", "Confirm final delivery point and border/transit process."],
    },
    {
        destinationCountry: "Rwanda",
        commonPorts: ["Mombasa via inland transit", "Dar es Salaam via inland transit"],
        commonAirports: ["Kigali International Airport"],
        seaRouteNotes: "Rwanda is landlocked, usually routed through East African ports and inland corridors.",
        airRouteNotes: "Air cargo to Kigali is practical for samples, urgent goods and compact high-value cargo.",
        estimatedTransitTimeRange: "Sea + inland: 25-45 days; Air: 3-8 days",
        fclLclSuitability: "LCL is possible but must account for inland handling. FCL suits repeat volume or sensitive cargo.",
        riskNotes: ["Inland transit visibility is important.", "Confirm consignee readiness before cargo arrival."],
    },
    {
        destinationCountry: "UAE",
        commonPorts: ["Jebel Ali", "Dubai", "Abu Dhabi/Khalifa"],
        commonAirports: ["Dubai International Airport", "Dubai World Central", "Abu Dhabi International Airport"],
        seaRouteNotes: "India-UAE has frequent sea services and is suitable for LCL, FCL and re-export planning.",
        airRouteNotes: "Air cargo is strong for samples, perishables, electronics and urgent shipments.",
        estimatedTransitTimeRange: "Sea: 5-14 days; Air: 1-4 days",
        fclLclSuitability: "LCL works well for small shipments; FCL is efficient for regular UAE/GCC distribution.",
        riskNotes: ["Check emirate-level import controls for regulated goods.", "Confirm whether cargo is for UAE consumption or re-export."],
    },
    {
        destinationCountry: "Saudi Arabia",
        commonPorts: ["Jeddah Islamic Port", "Dammam/King Abdulaziz Port"],
        commonAirports: ["Riyadh King Khalid International Airport", "Jeddah King Abdulaziz International Airport", "Dammam King Fahd International Airport"],
        seaRouteNotes: "Sea shipments commonly route to Jeddah or Dammam depending on buyer region.",
        airRouteNotes: "Air is useful for urgent parts, samples, pharma and electronics where compliance is ready.",
        estimatedTransitTimeRange: "Sea: 10-24 days; Air: 2-6 days",
        fclLclSuitability: "FCL is useful for bulk Gulf shipments; LCL works for samples/small consignments with clear documents.",
        riskNotes: ["SABER/SASO readiness can affect clearance timeline.", "Arabic labelling and conformity checks may be needed."],
    },
    {
        destinationCountry: "Oman",
        commonPorts: ["Sohar", "Muscat/Port Sultan Qaboos", "Salalah"],
        commonAirports: ["Muscat International Airport"],
        seaRouteNotes: "Oman sea freight can route through Sohar, Muscat or Salalah depending on cargo and consignee.",
        airRouteNotes: "Air cargo to Muscat is practical for samples, urgent goods and compact shipments.",
        estimatedTransitTimeRange: "Sea: 7-18 days; Air: 2-5 days",
        fclLclSuitability: "LCL for small trial shipments; FCL for regular or bulky cargo.",
        riskNotes: ["Confirm GCC conformity and destination local charges.", "Check final delivery distance from port."],
    },
    {
        destinationCountry: "Qatar",
        commonPorts: ["Hamad Port"],
        commonAirports: ["Hamad International Airport"],
        seaRouteNotes: "Hamad Port is the primary Qatar sea gateway for containerized cargo.",
        airRouteNotes: "Air cargo is useful for urgent, high-value or sample shipments.",
        estimatedTransitTimeRange: "Sea: 8-20 days; Air: 2-5 days",
        fclLclSuitability: "LCL is suitable for market testing; FCL suits repeat volume and project cargo.",
        riskNotes: ["Confirm ministry approvals for regulated products.", "Destination delivery timing should be planned around customs release."],
    },
    {
        destinationCountry: "China",
        commonPorts: ["Shanghai", "Shenzhen/Yantian", "Ningbo", "Qingdao", "Guangzhou/Nansha"],
        commonAirports: ["Shanghai Pudong", "Guangzhou Baiyun", "Shenzhen Bao'an", "Beijing Capital"],
        seaRouteNotes: "China-India trade uses multiple major ports. Choose port based on supplier/buyer city and inland freight.",
        airRouteNotes: "Air is useful for samples, electronics, urgent parts and compact high-value cargo.",
        estimatedTransitTimeRange: "Sea: 15-35 days; Air: 2-7 days",
        fclLclSuitability: "LCL for samples/small imports; FCL for regular sourcing or large export consignments.",
        riskNotes: ["Supplier due diligence and product compliance are critical.", "Confirm Incoterm, origin, inspection and loading photos before payment."],
    },
];

const logisticsRoutes = routeProfiles.map((profile) => ({
    originCountry: "India",
    destinationCountry: profile.destinationCountry,
    commonPorts: profile.commonPorts,
    commonAirports: profile.commonAirports,
    shipmentModes: ["sea", "air"],
    seaRouteNotes: profile.seaRouteNotes,
    airRouteNotes: profile.airRouteNotes,
    estimatedTransitTimeRange: profile.estimatedTransitTimeRange,
    fclLclSuitability: profile.fclLclSuitability,
    commonFreightDocuments,
    commonCharges,
    riskNotes: profile.riskNotes,
    lastUpdated: logisticsLastUpdated,
    dataType: "sample/manual",
}));

export {
    beginnerLogisticsEducation,
    logisticsCountries,
    logisticsDisclaimer,
    logisticsLastUpdated,
    logisticsRoutes,
};
