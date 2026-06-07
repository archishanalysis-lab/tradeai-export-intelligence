import CompanyProfile from "../models/CompanyProfile.js";
import CompanyReview from "../models/CompanyReview.js";
import Inquiry from "../models/Inquiry.js";

const calculateCompanyReputation = async (companyProfile) => {
    const organizationId = companyProfile.organizationId;

    const [totalInquiries, respondedInquiries, completedInquiries, reviews] = await Promise.all([
        Inquiry.countDocuments({ organizationId }),
        Inquiry.countDocuments({
            organizationId,
            "negotiationMessages.1": { $exists: true },
        }),
        Inquiry.countDocuments({ organizationId, status: "completed" }),
        CompanyReview.find({ companyProfile: companyProfile._id, status: "approved" }).select("rating"),
    ]);

    const ratingAverage = reviews.length
        ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
        : 0;
    const responseRate = totalInquiries ? Math.round((respondedInquiries / totalInquiries) * 100) : 0;
    const fulfillmentScore = totalInquiries ? Math.round((completedInquiries / totalInquiries) * 100) : 0;
    const reliabilityScore = Math.round(
        responseRate * 0.35 +
            fulfillmentScore * 0.35 +
            (companyProfile.verificationStatus === "verified" ? 20 : 0) +
            (ratingAverage / 5) * 10,
    );

    return {
        ratingAverage,
        reviewsCount: reviews.length,
        responseRate,
        averageResponseHours: responseRate ? 24 : 0,
        fulfillmentScore,
        reliabilityScore: Math.min(100, reliabilityScore),
    };
};

const refreshCompanyReputation = async (companyProfileId) => {
    const companyProfile = await CompanyProfile.findById(companyProfileId);

    if (!companyProfile) {
        return null;
    }

    const metrics = await calculateCompanyReputation(companyProfile);

    return CompanyProfile.findByIdAndUpdate(companyProfileId, metrics, {
        new: true,
    });
};

export { calculateCompanyReputation, refreshCompanyReputation };
