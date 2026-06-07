const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        res.status(400);
        next(
            new Error(
                result.error.issues
                    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                    .join("; "),
            ),
        );
        return;
    }

    req.validated = result.data;

    if (result.data.body) {
        req.body = result.data.body;
    }

    if (result.data.query) {
        Object.defineProperty(req, "query", {
            value: result.data.query,
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }

    if (result.data.params) {
        req.params = result.data.params;
    }

    next();
};

export { validate };
