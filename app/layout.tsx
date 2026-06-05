import type { Metadata } from "next";
import "./globals.css";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { APPLE_TOUCH_DATA_URL, FAVICON_DATA_URL } from "@/lib/brand/favicon";

export const metadata: Metadata = {
  title: "Rewardology Academy",
  description:
    "The global learning platform for Total Rewards, Compensation & Benefits professionals.",
  icons: {
    icon: [{ url: FAVICON_DATA_URL, type: "image/svg+xml" }],
    apple: [{ url: APPLE_TOUCH_DATA_URL, type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${editorialSerif.variable} ${editorialSans.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
