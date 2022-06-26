import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6db907df4ca344",
    pass: "9e1aa66dcbcd19",
  },
});
