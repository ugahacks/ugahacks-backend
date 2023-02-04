"use-strict";

const nodemailer = require("nodemailer");

const email: string | undefined = process.env.EMAIL;
const pass: string | undefined = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});

export const mailOptions = (recipients: string[]) => {
    return {
        from: email,
        to: recipients.join(", "),
    };
};