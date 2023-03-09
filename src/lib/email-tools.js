import sgMail from "@sendgrid/mail";

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
