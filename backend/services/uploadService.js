import { v2 as cloudinary } from "cloudinary";

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

const warnIfCloudinaryMissingInProduction = () => {
    if (process.env.NODE_ENV === "production" && !isCloudinaryConfigured()) {
        console.warn(
            "Cloudinary is not configured in production. Uploads will use local disk and may not persist across deploys or restarts.",
        );
    }
};

export {
    buildUploadedAsset,
    isCloudinaryConfigured,
    parseUploadUrl,
    uploadToCloudinary,
    warnIfCloudinaryMissingInProduction,
};
