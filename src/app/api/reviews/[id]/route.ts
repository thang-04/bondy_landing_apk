import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/reviews.json");

function getReviews(): any[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Lỗi khi đọc file reviews.json:", e);
  }
  return [];
}

function saveReviews(reviews: any[]) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (e) {
    console.error("Lỗi khi ghi file reviews.json:", e);
  }
}

export async function DELETE(
  request: Request,
  context: { params: any }
) {
  try {
    // Resolve params which can be a Promise in Next.js 15/16
    const params = await context.params;
    const reviewId = Number(params.id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const reviews = getReviews();
    const reviewExists = reviews.some((r) => Number(r.id) === reviewId);

    if (!reviewExists) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đánh giá" },
        { status: 404 }
      );
    }

    const filteredReviews = reviews.filter((r) => Number(r.id) !== reviewId);
    saveReviews(filteredReviews);

    return NextResponse.json({ success: true, message: "Đã xóa đánh giá thành công" });
  } catch (e: any) {
    console.error("Lỗi khi xóa đánh giá:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
