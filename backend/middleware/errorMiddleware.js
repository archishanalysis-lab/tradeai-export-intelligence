const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    const usageDetails = err.code
        ? {
              code: err.code,
              plan: err.plan,
              feature: err.feature,
              limit: err.limit,
              used: err.used,
              resetAt: err.resetAt,
          }
        : {};

    res.status(statusCode).json({
        success: false,
        error: err.message,
        message: err.message,
        ...usageDetails,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export { errorHandler, notFound };
