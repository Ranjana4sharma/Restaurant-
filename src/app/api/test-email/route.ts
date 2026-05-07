import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

/**
 * Handles GET requests to send a test email.
 * This is useful for easily testing from a browser using query parameters.
 * Example: /api/test-email?email=test@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required. Example: /api/test-email?email=test@example.com" },
        { status: 400 }
      );
    }

    const success = await sendEmail(
      email,
      "Test Email via Nodemailer (GET)",
      "This is a test email sent using Gmail OAuth2 configuration to verify the setup."
    );

    if (success) {
      return NextResponse.json({ success: true, message: "Test email sent successfully" });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send test email. Check server logs." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email GET route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to send a test email.
 * This is the standard way a client would interact with this API.
 * Expects JSON body: { "email": "test@example.com" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email field is required in the request body." },
        { status: 400 }
      );
    }

    const success = await sendEmail(
      email,
      "Test Email via Nodemailer (POST)",
      "This is a test email sent using Gmail OAuth2 configuration to verify the setup."
    );

    if (success) {
      return NextResponse.json({ success: true, message: "Test email sent successfully" });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send test email. Check server logs." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email POST route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
