import Contact from "../models/Contact.js";

const createContactMessage = async (req, res, next) => {
    try {
        const {
            name,
            email,
            company = "",
            roleType = "",
            feedbackType = "",
            priority = "",
            subject = "TradeAI stakeholder feedback",
            message,
            source = "mvp-feedback",
            interest = "",
        } = req.body;

        if (!name || !email || !message) {
            res.status(400);
            throw new Error("Name, email and message are required");
        }

        const contact = await Contact.create({
            name,
            email,
            company,
            roleType,
            feedbackType,
            priority,
            subject: subject || "TradeAI stakeholder feedback",
            message,
            source: source || "mvp-feedback",
            interest,
        });

        res.status(201).json({
            message: "Feedback received successfully",
            contactId: contact._id,
            status: contact.status,
        });
    } catch (error) {
        next(error);
    }
};

export { createContactMessage };
