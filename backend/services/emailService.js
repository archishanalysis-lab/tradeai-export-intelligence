const sendEmail = async ({ to, subject, message }) => {
    if (!to) {
        return { queued: false, reason: "Missing recipient" };
    }

    // Provider integration belongs here later: SMTP, SendGrid, Resend, etc.
    if (process.env.NODE_ENV !== "production") {
        console.log(`[email:queued] ${subject} -> ${to}`);
    }

    return {
        queued: true,
        to,
        subject,
        message,
    };
};

export { sendEmail };
