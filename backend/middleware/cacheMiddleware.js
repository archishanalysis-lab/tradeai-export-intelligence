const cacheStore = new Map();

const buildCacheKey = (req) => {
    const query = new URLSearchParams(req.query || {});
    query.sort();
    return `${req.method}:${req.baseUrl}${req.path}?${query.toString()}`;
};

const cacheMiddleware = ({ ttl = 300 } = {}) => (req, res, next) => {
    if (req.method !== "GET") {
        next();
        return;
    }

    const key = buildCacheKey(req);
    const cached = cacheStore.get(key);

    if (cached && cached.expiresAt > Date.now()) {
        res.set("X-TradeAI-Cache", "HIT");
        res.json(cached.payload);
        return;
    }

    const originalJson = res.json.bind(res);

    res.json = (payload) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cacheStore.set(key, {
                payload,
                expiresAt: Date.now() + ttl * 1000,
            });
        }

        res.set("X-TradeAI-Cache", "MISS");
        return originalJson(payload);
    };

    next();
};

export { cacheMiddleware };
