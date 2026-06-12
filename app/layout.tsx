import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthAI - Theo dõi sức khỏe thông minh",
  description: "Ứng dụng theo dõi sức khỏe dựa trên AI: phân tích khẩu phần ăn và xét nghiệm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
