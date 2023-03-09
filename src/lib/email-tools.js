import sgMail from "@sendgrid/mail";
import { join } from "path";
import { dataFolderPath } from "./fs-tools.js";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendRegistrationEmail = async (recipientAdress) => {
  const msg = {
    to: recipientAdress,
    from: process.env.SENDER_EMAIL_ADDRESS,
    subject: "Hello!",
    text: "Thanks for registration!",
  };
  await sgMail.send(msg);
};

export const sendPostPublishedEmail = async (recipientAdress, filename) => {
  const pdfPath = join(dataFolderPath, `${filename}.pdf`);
  fs.readFile(pdfPath, "base64", async (err, pdfBase64) => {
    if (!err) {
      const msg = {
        to: recipientAdress,
        from: process.env.SENDER_EMAIL_ADDRESS,
        subject: "Post successfully created!",
        text: "Thanks for your contribution!",
        attachments: [
          {
            content: pdfBase64,
            filename: `${filename}.pdf`,
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      };
      await sgMail.send(msg);
    }
  });
};
