import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, pickAnyAvailableStaff } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId") || undefined;

  if (!serviceId || !date) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const result = await getAvailableSlots(serviceId, date, staffId);
    const availableStaff = result.slots
      .filter((s) => s.isAvailable)
      .reduce((acc, slot) => {
        if (!acc.find((s) => s.id === slot.staffId)) {
          acc.push({ id: slot.staffId, name: slot.staffName });
        }
        return acc;
      }, [] as { id: string; name: string }[]);

    return NextResponse.json({ slots: result.slots, availableStaff });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}