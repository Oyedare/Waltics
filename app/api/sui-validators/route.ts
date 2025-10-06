import { NextResponse } from "next/server";
import { getValidatorData } from "@/lib/sui/validator";

export async function GET() {
  try {
    const validatorData = await getValidatorData();
    return NextResponse.json(validatorData);
  } catch (error) {
    console.error("Error fetching validator data:", error);
    return NextResponse.json(
      { error: "Failed to fetch validator data" },
      { status: 500 }
    );
  }
}
