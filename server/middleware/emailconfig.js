import nodemailer from "nodemailer";
import { email_template } from "../lib/emailTemp.js";

const sendEmail = async (email, verificationCode) => {
    const emailUser = process.env.nodemailer_email;
    const emailPass = process.env.nodemailer_password;

    if (!emailUser || !emailPass) {
        throw new Error("Nodemailer environment variables are missing at invocation time.");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"ArgusCode Platform" <${emailUser}>`,
            to: email,
            subject: "Verify Your Email Address",
            text: `Your verification code is: ${verificationCode}`,
            html: email_template.replace("{verificationCode}", verificationCode),
        });
        
        console.log("Email sent successfully! MessageID:", info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Transport Error:", error);
        throw error;
    }
};

export default sendEmail;