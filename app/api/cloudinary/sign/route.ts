import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Gives the admin's browser a one-time signature so photos upload straight to Cloudinary.
// The API secret never leaves the server.
export async function POST() {
  const { profile } = await getSession();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return NextResponse.json({ error: "Cloudinary is not set up yet. Add the three Cloudinary keys to the environment variables." }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "al-hayat";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return NextResponse.json({ cloud, key, timestamp, folder, signature });
}
