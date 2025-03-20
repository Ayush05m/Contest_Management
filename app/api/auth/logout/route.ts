import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the auth cookie
    response.cookies.set({
      name: "token",
      value: "",
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set({
      name: "AUTH_TOKEN",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    );
  }
}
