import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const analyticsDomains = (
  process.env.NEXT_PUBLIC_ANALYTICS_DOMAINS ?? ""
)
  .split(",")
  .map((domain) => domain.trim())
  .filter(Boolean);

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
        {analyticsEnabled && gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  linker: {
                    domains: ${JSON.stringify(analyticsDomains)}
                  }
                });
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
