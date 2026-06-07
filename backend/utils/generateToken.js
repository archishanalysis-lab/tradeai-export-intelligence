import jwt from "jsonwebtoken";

const generateToken = (user) => {
    const payload =
        typeof user === "object" && user !== null
            ? {
                  id: String(user._id || user.id),
                  role: user.role,
                  status: user.status,
                  organizationId: user.organizationId ? String(user.organizationId) : undefined,
                  company: user.company,
                  email: user.email,
                  name: user.name,
              }
            : { id: user };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "30d",
    });
};

export default generateToken;
