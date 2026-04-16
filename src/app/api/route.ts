import { NextRequest, NextResponse } from "next/server";
import { pipeline, env } from "@huggingface/transformers";
import path from "path";

// Ensure models are cached in a writable directory
env.cacheDir = path.join(process.cwd(), ".cache");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detectorPromise: Promise<any> | null = null;

async function getDetector() {
  if (!detectorPromise) {
    console.log("Loading Object Detection model locally...");
    detectorPromise = pipeline("object-detection", "Xenova/detr-resnet-50");
  }
  return detectorPromise;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("theImage") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to Blob for Transformers.js
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type || "image/jpeg" });

    // Initialize/Retrieve the local detector model
    const detector = await getDetector();

    // Perform Object Detection natively without external API requests!
    const result = await detector(blob);

    return NextResponse.json({ body: result }, { status: 200 });

  } catch (error: unknown) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}