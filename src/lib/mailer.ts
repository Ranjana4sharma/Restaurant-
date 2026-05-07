import nodemailer from "nodemailer";

// Configure Nodemailer transporter using Gmail OAuth2
// We rely on environment variables for sensitive data
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

/**
 * Sends a basic email using the configured transporter.
 * Handles errors gracefully and avoids crashing the server.
 * 
 * @param to - The recipient's email address
 * @param subject - The subject of the email
 * @param text - The plain text body of the email
 * @returns A boolean indicating whether the email was sent successfully
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    // Basic validation to ensure environment variables are present
    if (!process.env.EMAIL_USER || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN) {
      console.error("Missing required email environment variables.");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to, // List of receivers
      subject, // Subject line
      text, // Plain text body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Helper function to send an OTP email.
 * 
 * @param email - The recipient's email address
 * @param otp - The one-time password code
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const subject = "Your OTP Code";
  const text = `Your OTP is: ${otp}`;
  return sendEmail(email, subject, text);
}

/**
 * Helper function to send a reservation status email.
 * 
 * @param email - The recipient's email address
 * @param status - The status of the reservation
 * @param note - An optional note (used for rejection reasons, etc.)
 */
export async function sendReservationEmail(
  email: string,
  status: "approved" | "rejected" | "pending",
  note?: string
): Promise<boolean> {
  const subject = "The Royal Platter - Reservation Status Update";
  let text = "";

  if (status === "approved") {
    text = `Your table is confirmed. Thank you!\n\n${note ? `Admin Note: ${note}` : ""}`;
  } else if (status === "rejected") {
    text = `Your reservation was not accepted. Reason: ${note || "Not specified"}`;
  } else if (status === "pending") {
    text = "Your reservation request is pending.";
  }

  return sendEmail(email, subject, text);
}

/**
 * Sends an order confirmation email.
 * 
 * @param email - The recipient's email address
 * @param orderDetails - Object containing orderId and amount
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: { orderId: string; amount: number }
): Promise<boolean> {
  const subject = "Order Confirmed 🎉";
  const text = `Hi,
Your order has been successfully placed.

Order Details:
* Order ID: ${orderDetails.orderId}
* Total Amount: ₹${orderDetails.amount}

Thank you for ordering with us!`;

  return sendEmail(email, subject, text);
}
