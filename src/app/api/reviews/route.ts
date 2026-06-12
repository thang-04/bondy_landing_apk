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

export async function GET() {
  const reviews = getReviews();
  return NextResponse.json({ success: true, data: reviews });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, status, emoji, mood, text } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Họ tên và nội dung đánh giá là bắt buộc" },
        { status: 400 }
      );
    }

    const reviews = getReviews();
    const newReview = {
      id: Date.now(),
      name: name.trim(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80`, // Random unsplash photo
      rating: Number(rating) || 5,
      status: status || "Độc thân",
      emoji: emoji || "🧘‍♀️",
      mood: mood || "Bình yên",
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    return NextResponse.json({ success: true, data: newReview });
  } catch (e: any) {
    console.error("Lỗi khi thêm đánh giá:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
