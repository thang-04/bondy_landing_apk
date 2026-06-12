import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const downloadsPath = path.join(process.cwd(), "src/data/downloads.json");
const visitsPath = path.join(process.cwd(), "src/data/visits.json");

function getCount(filePath: string, defaultCount: number): number {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return typeof json.count === "number" ? json.count : defaultCount;
    }
  } catch (e) {
    console.error(`Lỗi khi đọc file ${path.basename(filePath)}:`, e);
  }
  return defaultCount;
}

export async function GET() {
  const downloads = getCount(downloadsPath, 0);
  const visits = getCount(visitsPath, 0);
  return NextResponse.json({
    success: true,
    downloads,
    visits
  });
}
