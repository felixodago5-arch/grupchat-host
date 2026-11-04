
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/calendar?google=cancelled", request.url)
    );
  }

  try {
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth.getToken(code);
    oauth.setCredentials(tokens);

    const supabase = createAdminClient();

    // Temporary development owner ID until user sign-in is implemented.
    const userId = "00000000-0000-0000-0000-000000000001";

    const { error: dbError } = await supabase
      .from("google_calendar_connections")
      .upsert(
        {
          user_id: userId,
          google_email: null,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (dbError) throw dbError;

    return NextResponse.redirect(
      new URL("/calendar?google=connected", request.url)
    );
  } catch (err) {
    console.error("Google callback failed:", err);

    return NextResponse.redirect(
      new URL("/calendar?google=error", request.url)
    );
  }
}
