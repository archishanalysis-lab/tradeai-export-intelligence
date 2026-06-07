const buildPagination = (query = {}, defaults = {}) => {
    const page = Math.max(Number(query.page) || defaults.page || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || defaults.limit || 12, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const buildSort = (sort = "-createdAt", allowed = []) => {
    const field = sort.startsWith("-") ? sort.slice(1) : sort;

    if (allowed.length && !allowed.includes(field)) {
        return { createdAt: -1 };
    }

    return { [field]: sort.startsWith("-") ? -1 : 1 };
};

const buildTextOrRegexSearch = (search, fields = []) => {
    const cleanSearch = search?.trim();

    if (!cleanSearch) {
        return {};
    }

    return {
        $or: fields.map((field) => ({
            [field]: { $regex: cleanSearch, $options: "i" },
        })),
    };
};

const buildRangeFilter = (query = {}, field, targetField = field) => {
    const filter = {};
    const min = query[`${field}Min`];
    const max = query[`${field}Max`];

    if (min !== undefined) filter.$gte = Number(min);
    if (max !== undefined) filter.$lte = Number(max);

    return Object.keys(filter).length ? { [targetField]: filter } : {};
};

export { buildPagination, buildRangeFilter, buildSort, buildTextOrRegexSearch };
