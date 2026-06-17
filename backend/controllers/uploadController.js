import {
    buildUploadedAsset,
    createCloudinaryConfigurationError,
    isCloudinaryConfigured,
    uploadToCloudinary,
} from "../services/uploadService.js";

const handleUpload = (documentType) => async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error("File is required");
        }

        const cloudinaryResult = await uploadToCloudinary(
            req.file.path,
            `tradeai/${documentType}`,
        );

        if (process.env.NODE_ENV === "production" && !cloudinaryResult) {
            throw createCloudinaryConfigurationError();
        }

        const asset = cloudinaryResult
            ? buildUploadedAsset({ ...cloudinaryResult, mimetype: req.file.mimetype, size: req.file.size })
            : buildUploadedAsset(req.file, `/uploads/${req.file.filename}`);

        res.status(201).json({
            ...asset,
            documentType,
            storage: isCloudinaryConfigured() ? "cloudinary" : "local",
        });
    } catch (error) {
        next(error);
    }
};

const uploadProductImage = handleUpload("product-image");
const uploadCertificate = handleUpload("certificate");
const uploadCatalog = handleUpload("catalog");
const uploadInvoice = handleUpload("invoice");

export { uploadCatalog, uploadCertificate, uploadInvoice, uploadProductImage };
