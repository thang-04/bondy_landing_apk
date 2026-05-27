import { NextResponse } from "next/server";

// Cấu trúc dữ liệu Log chuẩn hóa
interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
  meta?: Record<string, any>;
}

// Hàm sinh mock logs ngẫu nhiên chất lượng cao để hiển thị ban đầu
function generateMockLogs(count: number = 40): LogEntry[] {
  const services = [
    "auth-service",
    "dating-match",
    "chat-service",
    "payment-gateway",
    "apk-downloader",
    "database",
    "api-gateway",
    "notification"
  ];

  const levels: ("info" | "warn" | "error" | "debug")[] = ["info", "info", "info", "debug", "warn", "error"];

  const messages = {
    "auth-service": [
      { level: "info", text: "Người dùng đăng nhập thành công", meta: { userId: "usr_9283f2", ip: "113.161.42.10", device: "iOS 17.4" } },
      { level: "info", text: "Tạo mới tài khoản người dùng thành công", meta: { email: "nguyenvana@gmail.com", method: "Google OAuth" } },
      { level: "warn", text: "Phát hiện đăng nhập sai mật khẩu 3 lần liên tiếp", meta: { userId: "usr_283812", ip: "203.113.16.8" } },
      { level: "error", text: "Lỗi giải mã JWT token: Token expired", meta: { tokenType: "Access Token", duration: "1h" } }
    ],
    "dating-match": [
      { level: "info", text: "Đã ghép đôi thành công cho 2 người dùng", meta: { userA: "usr_9283f2", userB: "usr_10293b", score: 0.94 } },
      { level: "debug", text: "Tính toán độ tương thích thuật toán dựa trên sở thích", meta: { durationMs: 42, filters: ["hà nội", "du lịch", "music"] } },
      { level: "info", text: "Người dùng thực hiện vuốt phải (Swipe Right)", meta: { from: "usr_10293b", to: "usr_77218a" } }
    ],
    "chat-service": [
      { level: "info", text: "Kết nối WebSocket được thiết lập thành công", meta: { socketId: "ws_acb829", userId: "usr_9283f2" } },
      { level: "debug", text: "Đã gửi tin nhắn được mã hóa E2EE thành công", meta: { messageId: "msg_8829a", type: "text" } },
      { level: "warn", text: "Độ trễ truyền tin nhắn WebSocket vượt ngưỡng (320ms)", meta: { socketId: "ws_88291a", pingMs: 320 } }
    ],
    "payment-gateway": [
      { level: "info", text: "Khởi tạo cổng thanh toán VNPay thành công", meta: { amount: 199000, orderId: "vnp_88291a8" } },
      { level: "info", text: "Xử lý Webhook thanh toán Premium thành công (VIP Plan)", meta: { orderId: "vnp_88291a8", userId: "usr_9283f2", amount: 199000 } },
      { level: "error", text: "Lỗi xác thực chữ ký số VNPay Webhook (Checksum failure)", meta: { receiveSign: "adbc92a83...", calculatedSign: "bdca82713..." } }
    ],
    "apk-downloader": [
      { level: "info", text: "Khởi chạy tải APK: bondy-release-v1.2.0.apk", meta: { referrer: "https://bondy.vn/", userAgent: "Mozilla/5.0 (Android)" } },
      { level: "info", text: "Hoàn tất tải tệp APK thành công từ Cloudflare CDN", meta: { sizeMb: 42.6, durationSec: 4.8 } },
      { level: "warn", text: "Băng thông tải APK giảm nhẹ, chuyển hướng dự phòng CDN", meta: { activeNode: "sg-node-03", latency: "420ms" } }
    ],
    "database": [
      { level: "info", text: "Database connection pool scale: 15/50 active connections", meta: { host: "aws-rds-postgres" } },
      { level: "warn", text: "Phát hiện truy vấn SQL chạy chậm (Slow Query Warning)", meta: { durationMs: 1420, sql: "SELECT * FROM matches WHERE user_id = $1 AND matched = true ORDER BY created_at DESC" } },
      { level: "debug", text: "Chạy thành công Migration database: add_premium_features_table", meta: { version: "2026052712" } }
    ],
    "api-gateway": [
      { level: "info", text: "GET /api/v1/users/profile - 200 OK", meta: { durationMs: 12, sizeBytes: 1240 } },
      { level: "info", text: "POST /api/v1/auth/refresh - 200 OK", meta: { durationMs: 18, sizeBytes: 420 } },
      { level: "error", text: "GET /api/v1/admin/analytics - 403 Forbidden", meta: { clientIp: "113.161.42.10", path: "/api/v1/admin/analytics" } }
    ],
    "notification": [
      { level: "info", text: "Đã gửi Firebase Push Notification thành công", meta: { userId: "usr_10293b", title: "Có người vừa thả tim bạn!", type: "match" } },
      { level: "warn", text: "Gửi Email chào mừng thất bại, đang xếp hàng gửi lại (Queue)", meta: { email: "test_failed@gmail.com", error: "SMTP Timeout" } }
    ]
  };

  const logs: LogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Thời gian lùi dần từ hiện tại
    const logTime = new Date(now.getTime() - (count - i) * (Math.random() * 20 + 5) * 1000);
    const service = services[Math.floor(Math.random() * services.length)];
    const messageTemplates = messages[service as keyof typeof messages];
    const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

    logs.push({
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: logTime.toISOString(),
      level: template.level as "info" | "warn" | "error" | "debug",
      service,
      message: template.text,
      meta: template.meta
    });
  }

  return logs;
}

export async function GET(request: Request) {
  try {
    // 1. Kiểm tra mã xác thực từ client gửi lên qua header
    const accessCode = request.headers.get("x-access-code");
    
    // Mật mã mong muốn lấy từ biến môi trường, mặc định là "admin" ở môi trường local nếu chưa định cấu hình
    const expectedPassword = process.env.INTERNAL_LOGS_PASSWORD;
    const isProd = process.env.NODE_ENV === "production";

    // Ở môi trường production (Vercel), BẮT BUỘC phải cấu hình INTERNAL_LOGS_PASSWORD để bảo mật
    if (isProd && !expectedPassword) {
      console.error("CẢNH BÁO BẢO MẬT: Chưa cấu hình INTERNAL_LOGS_PASSWORD trên Vercel!");
      return NextResponse.json(
        { error: "Hệ thống chưa được thiết lập mã bảo mật. Vui lòng cấu hình INTERNAL_LOGS_PASSWORD trên Vercel." },
        { status: 500 }
      );
    }

    const secureCode = expectedPassword || "admin";

    if (!accessCode || accessCode !== secureCode) {
      return NextResponse.json(
        { error: "Mã truy cập không hợp lệ. Vui lòng thử lại!" },
        { status: 401 }
      );
    }

    // 2. Kiểm tra nếu có LOG_SERVER_URL thì gọi Proxy tới server thật
    const logServerUrl = process.env.LOG_SERVER_URL;
    const logServerApiKey = process.env.LOG_SERVER_API_KEY;

    if (logServerUrl) {
      console.log(`[API Proxy] Đang fetch logs từ server thật: ${logServerUrl}`);
      
      const fetchHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (logServerApiKey) {
        // Tùy theo định dạng xác thực của backend, thường là Authorization: Bearer <key> hoặc x-api-key: <key>
        if (logServerApiKey.startsWith("Bearer ") || logServerApiKey.startsWith("Basic ")) {
          fetchHeaders["Authorization"] = logServerApiKey;
        } else {
          fetchHeaders["Authorization"] = `Bearer ${logServerApiKey}`;
          fetchHeaders["x-api-key"] = logServerApiKey;
        }
      }

      const res = await fetch(logServerUrl, {
        method: "GET",
        headers: fetchHeaders,
        next: { revalidate: 0 } // Không cache dữ liệu logs
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { 
            error: `Lỗi kết nối từ Log Server thật (HTTP ${res.status}): ${errorText.substring(0, 100)}`,
            isMock: false,
            logs: [] 
          },
          { status: 502 }
        );
      }

      // Đọc dữ liệu từ Server. Có thể là JSON hoặc Text Stream lines
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        // Giả sử server trả về mảng logs, hoặc ta phải chuẩn hóa.
        // Ta sẽ trả về trực tiếp hoặc map lại nếu cần.
        const logs = Array.isArray(data) ? data : (data.logs || [data]);
        return NextResponse.json({
          isMock: false,
          logs: logs
        });
      } else {
        // Nếu là định dạng text log thô (Nginx, console output...)
        const rawText = await res.text();
        const lines = rawText.split("\n").filter(line => line.trim() !== "");
        
        // Convert text lines thành LogEntry objects đơn giản hoặc parse JSON nếu có cấu trúc JSON
        const logs: LogEntry[] = lines.map((line, idx) => {
          let level: "info" | "warn" | "error" | "debug" = "info";
          let service = "server-raw";
          let message = line;
          let meta: Record<string, any> | undefined = { raw: true };
          
          // Khởi tạo timestamp mặc định
          let timestamp = new Date(Date.now() - idx * 1000).toISOString();

          // Tìm xem trong dòng log có chứa một JSON Object không
          const jsonStartIndex = line.indexOf("{");
          const jsonEndIndex = line.lastIndexOf("}");

          if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
            const prefix = line.substring(0, jsonStartIndex).trim();
            const jsonString = line.substring(jsonStartIndex, jsonEndIndex + 1);

            try {
              const jsonObject = JSON.parse(jsonString);

              // 1. Phân tích cấp độ Log (Level) từ JSON
              if (jsonObject.level) {
                const lvl = jsonObject.level.toLowerCase();
                if (lvl === "error" || lvl === "err" || lvl === "fatal" || lvl === "crit") level = "error";
                else if (lvl === "warn" || lvl === "warning") level = "warn";
                else if (lvl === "debug" || lvl === "trace") level = "debug";
                else level = "info";
              }

              // 2. Phân tích tên Service & Message từ JSON (ví dụ "swipes:mutual-match-detected")
              const rawMsg = jsonObject.msg || jsonObject.message || "";
              if (rawMsg) {
                const colonIdx = rawMsg.indexOf(":");
                if (colonIdx !== -1) {
                  // Cắt lấy phần trước dấu : làm service và phần sau làm message hiển thị
                  service = rawMsg.substring(0, colonIdx).trim();
                  message = rawMsg.substring(colonIdx + 1).trim();
                } else {
                  service = "server-app";
                  message = rawMsg;
                }
              } else {
                service = "server-app";
                message = line;
              }

              // 3. Phân tích Timestamp từ JSON hoặc Prefix
              if (jsonObject.time || jsonObject.timestamp) {
                timestamp = new Date(jsonObject.time || jsonObject.timestamp).toISOString();
              } else if (prefix) {
                // Thử parse thời gian từ prefix log (Ví dụ: "2026-05-27 21:58:22 +07:00:")
                const cleanPrefix = prefix.replace(/:$/, "").trim();
                const d = new Date(cleanPrefix);
                if (!isNaN(d.getTime())) {
                  timestamp = d.toISOString();
                }
              }

              // 4. Các trường dữ liệu còn lại trong JSON sẽ được đóng gói đưa vào Meta Details
              const tempMeta = { ...jsonObject };
              delete tempMeta.level;
              delete tempMeta.time;
              delete tempMeta.timestamp;
              delete tempMeta.msg;
              delete tempMeta.message;

              if (Object.keys(tempMeta).length > 0) {
                meta = tempMeta;
              } else {
                meta = undefined;
              }

            } catch (e) {
              // Parse JSON lỗi -> fallback sang parse text thô thông thường
              parseRawText(line, prefix);
            }
          } else {
            // Không chứa cấu trúc JSON -> parse text thô thông thường
            parseRawText(line, "");
          }

          // Hàm bổ trợ parse log dạng text thuần thô
          function parseRawText(rawLine: string, prefixStr: string) {
            const lower = rawLine.toLowerCase();
            if (lower.includes("error") || lower.includes("err") || lower.includes("crit") || lower.includes("fail")) {
              level = "error";
            } else if (lower.includes("warn") || lower.includes("warning")) {
              level = "warn";
            } else if (lower.includes("debug") || lower.includes("trace")) {
              level = "debug";
            }

            // Trích xuất thời gian từ chuỗi text
            const tsMatch = rawLine.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
            if (tsMatch) {
              const d = new Date(tsMatch[0].replace(" ", "T"));
              if (!isNaN(d.getTime())) {
                timestamp = d.toISOString();
              }
            } else if (prefixStr) {
              const cleanPrefix = prefixStr.replace(/:$/, "").trim();
              const d = new Date(cleanPrefix);
              if (!isNaN(d.getTime())) {
                timestamp = d.toISOString();
              }
            }

            service = "server-raw";
            message = rawLine;
            meta = { raw: true };
          }

          return {
            id: `server_${idx}_${Date.now().toString(36)}`,
            timestamp,
            level,
            service,
            message,
            meta
          };
        });

        return NextResponse.json({
          isMock: false,
          logs: logs
        });
      }
    }

    // 3. Nếu chưa cấu hình LOG_SERVER_URL -> Trả về Mock Logs chất lượng cao
    // Thêm một log thông báo trạng thái Demo
    const mockLogs = generateMockLogs(50);
    mockLogs.push({
      id: "log_status_welcome",
      timestamp: new Date().toISOString(),
      level: "info",
      service: "api-gateway",
      message: "🔐 Đã kết nối API Proxy thành công. Bạn đang xem Mock Logs giả lập. Cấu hình biến môi trường LOG_SERVER_URL để kết nối server thực tế.",
      meta: {
        env_configured: {
          INTERNAL_LOGS_PASSWORD: !!expectedPassword,
          LOG_SERVER_URL: !!logServerUrl
        },
        vercel_deployment: true
      }
    });

    return NextResponse.json({
      isMock: true,
      logs: mockLogs
    });

  } catch (error: any) {
    console.error("Lỗi trong API Logs Proxy Router:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
