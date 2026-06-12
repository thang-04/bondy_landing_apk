import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/downloads.json");
const defaultCount = 0;

function getCount(): number {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return typeof json.count === "number" ? json.count : defaultCount;
    }
  } catch (e) {
    console.error("Lỗi khi đọc file downloads.json:", e);
  }
  return defaultCount;
}

function saveCount(count: number) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify({ count }, null, 2), "utf-8");
  } catch (e) {
    console.error("Lỗi khi ghi file downloads.json:", e);
  }
}

export async function GET() {
  const count = getCount();
  return NextResponse.json({ success: true, count });
}

export async function POST() {
  const count = getCount() + 1;
  saveCount(count);
  return NextResponse.json({ success: true, count });
}
