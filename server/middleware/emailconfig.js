import nodemailer from "nodemailer";
import { email_template } from "../lib/emailTemp.js";
import dns from "dns";


const sendEmail = async (email, verificationCode) => {
    // const emailUser = process.env.nodemailer_email;
    // const emailPass = process.env.nodemailer_password;  
    const brevoMail = process.env.BREVO_MAIL;

    // if (!emailUser || !emailPass) {
    //     throw new Error("Nodemailer environment variables are missing at invocation time.");
    // }

    dns.setDefaultResultOrder("ipv4first");

    console.log("SMTP_USER:", process.env.BREVO_SMTP_USER);
console.log("BREVO_MAIL:", process.env.BREVO_MAIL);

    const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});



    try {

//         await transporter.verify();
// console.log("Brevo SMTP Connected");
        const info = await transporter.sendMail({
            from: `"ArgusCode Platform" <${brevoMail}>`,
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