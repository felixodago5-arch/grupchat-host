

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function getCalendarAuth() {
  const supabase = createAdminClient();

  const { data: connection, error } = await supabase
    .from("google_calendar_connections")
    .select("user_id, access_token, refresh_token, expires_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Calendar connection lookup error:", error);
    throw new ApiError("Could not look up the Google Calendar connection.", 500);
  }

  if (!connection) {
    throw new ApiError("Google Calendar is not connected.", 401);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new ApiError("Google Calendar OAuth is not configured.", 500);
  }

  const accessToken = connection.access_token;
  const refreshToken = connection.refresh_token;
  const expiresAt = connection.expires_at
    ? new Date(connection.expires_at).getTime()
    : null;
  const expired =
    !accessToken ||
    (expiresAt !== null && Number.isFinite(expiresAt) && expiresAt <= Date.now() + 60_000);

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: accessToken || undefined,
    refresh_token: refreshToken || undefined,
  });

  if (expired) {
    if (!refreshToken) {
      throw new ApiError(
        "Google Calendar authorization has expired. Reconnect Google Calendar.",
        401
      );
    }

    try {
      const { credentials } = await auth.refreshAccessToken();
      const newAccessToken = credentials.access_token;

      if (!newAccessToken) {
        throw new Error("Google did not return a new access token.");
      }

      auth.setCredentials({
        access_token: newAccessToken,
        refresh_token: credentials.refresh_token || refreshToken,
      });

      const expiresAtValue = credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : null;

      const { error: updateError } = await supabase
        .from("google_calendar_connections")
        .update({
          access_token: newAccessToken,
          refresh_token: credentials.refresh_token || refreshToken,
          expires_at: expiresAtValue,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", connection.user_id);

      if (updateError) {
        console.error("Calendar token refresh update error:", updateError);
      }
    } catch (error) {
      console.error("Google access token refresh error:", error);
      throw new ApiError(
        "Google Calendar authorization has expired. Reconnect Google Calendar.",
        401
      );
    }
  }

  return auth;
}

export async function GET() {
  try {
    const auth = await getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json(
      { events: result.data.items ?? [] },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number"
        ? error.code
        : 500;

    if (status === 401) {
      return NextResponse.json(
        { error: "Google Calendar authorization is invalid. Reconnect Google Calendar." },
        { status: 401 }
      );
    }

    if (status === 403) {
      return NextResponse.json(
        { error: "Google Calendar access was denied." },
        { status: 403 }
      );
    }

    console.error("List events error:", error);
    return NextResponse.json(
      { error: "Could not retrieve calendar events." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, start, end } = body;

    if (!summary || !start || !end) {
      return NextResponse.json(
        { error: "Title, start and end are required." },
        { status: 400 }
      );
    }

    const auth = await getCalendarAuth();

    const calendar = google.calendar({ version: "v3", auth });

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        description,
        start,
        end,
      },
    });

    return NextResponse.json({
      success: true,
      event: result.data,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number"
        ? error.code
        : 500;

    if (status === 401) {
      return NextResponse.json(
        { error: "Google Calendar authorization is invalid. Reconnect Google Calendar." },
        { status: 401 }
      );
    }

    if (status === 403) {
      return NextResponse.json(
        { error: "Google Calendar access was denied." },
        { status: 403 }
      );
    }

    console.error("Create event error:", error);

    return NextResponse.json(
      { error: "Could not create calendar event." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const auth = await getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number"
        ? error.code
        : 500;

    if (status === 404 || status === 410) {
      return NextResponse.json(
        { error: "The calendar event no longer exists." },
        { status: 404 }
      );
    }

    if (status === 401) {
      return NextResponse.json(
        { error: "Google Calendar authorization is invalid. Reconnect Google Calendar." },
        { status: 401 }
      );
    }

    if (status === 403) {
      return NextResponse.json(
        { error: "Google Calendar access was denied." },
        { status: 403 }
      );
    }

    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Could not delete calendar event." },
      { status: 500 }
    );
  }
}
