import { Cormorant_Garamond, DM_Sans } from "next/font/google";

export const editorialSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-home-serif",
  display: "swap",
});

export const editorialSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-home-sans",
  display: "swap",
});
