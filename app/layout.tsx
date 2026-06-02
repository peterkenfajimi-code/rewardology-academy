import type { Metadata } from "next";
import "./globals.css";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Rewardology Academy",
  description:
    "The global learning platform for Total Rewards, Compensation & Benefits professionals.",
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
