import { v2 as cloudinary } from "cloudinary";

const isProduction = () => process.env.NODE_ENV === "production";

const isCloudinaryConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET,
    );

const configureCloudinary = () => {
    if (!isCloudinaryConfigured()) {
        return false;
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return true;
};

const uploadToCloudinary = async (filePath, folder = "tradeai") => {
    if (!configureCloudinary()) {
        return null;
    }

    return cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "auto",
    });
};

const buildUploadedAsset = (file = {}, fallbackUrl = "") => ({
    url: file.secure_url || file.path || fallbackUrl,
    publicId: file.filename || file.public_id || "",
    mimeType: file.mimetype || "",
    size: file.size || 0,
});

const parseUploadUrl = (value = "") => value.toString().trim();

const createCloudinaryConfigurationError = () => {
    const error = new Error(
        "Cloudinary is not configured for production uploads. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET before uploading files.",
    );
    error.status = 503;
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    return error;
};

const requirePersistentUploadStorage = (req, res, next) => {
    if (isProduction() && !isCloudinaryConfigured()) {
        next(createCloudinaryConfigurationError());
        return;
    }

    next();
};

const shouldServeLocalUploads = () => !isProduction();

const warnIfCloudinaryMissingInProduction = () => {
    if (isProduction() && !isCloudinaryConfigured()) {
        console.warn(
            "Cloudinary is not configured in production. Upload routes will fail-safe instead of returning ephemeral local disk URLs.",
        );
    }
};

export {
    buildUploadedAsset,
    createCloudinaryConfigurationError,
    isCloudinaryConfigured,
    parseUploadUrl,
    requirePersistentUploadStorage,
    shouldServeLocalUploads,
    uploadToCloudinary,
    warnIfCloudinaryMissingInProduction,
};
