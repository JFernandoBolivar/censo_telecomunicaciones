import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { API } from "@/shared/commons/api";

export async function GET() {
  const session = await auth();
  if (!session?.user.djAccess) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(`${API.url}encuestas/exportar-excel/`, {
    headers: { Authorization: `Bearer ${session.user.djAccess}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }

  const blob = await res.blob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=respuestas.xlsx",
    },
  });
}
