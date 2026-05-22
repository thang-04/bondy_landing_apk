import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bondy – Kết nối thật, cảm xúc thật",
  description: "Ứng dụng hẹn hò giúp bạn tìm kiếm kết nối ý nghĩa, trò chuyện tự nhiên hơn và chăm sóc cảm xúc của mình mỗi ngày.",
  icons: {
    icon: "/bondy-heart-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
