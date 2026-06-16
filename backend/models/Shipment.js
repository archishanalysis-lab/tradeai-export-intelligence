import mongoose from "mongoose";

// Future placeholder: no shipment CRUD route is mounted in the MVP release.
// Keep this model unmounted until the logistics workflow persists shipments.
const shipmentSchema = new mongoose.Schema(
    {
        referenceNo: {
            type: String,
            required: true,
            trim: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Buyer",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        originCountry: {
            type: String,
            trim: true,
            default: "",
        },
        destinationCountry: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["planned", "in_transit", "delivered", "delayed"],
            default: "planned",
        },
        eta: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;
