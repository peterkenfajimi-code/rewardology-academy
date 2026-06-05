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
    shortcut: [{ url: FAVICON_DATA_URL }],
    apple: [{ url: APPLE_TOUCH_DATA_URL, type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={FAVICON_DATA_URL} type="image/svg+xml" />
        <link rel="shortcut icon" href={FAVICON_DATA_URL} />
        <link rel="apple-touch-icon" href={APPLE_TOUCH_DATA_URL} />
      </head>
      <body className={`${editorialSerif.variable} ${editorialSans.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
