import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drishti — AI-driven climate-health early warning for children",
  description:
    "An open-source platform combining satellite screening and drone verification to predict and prevent vector-borne disease outbreaks in climate-vulnerable communities.",
  openGraph: {
    title: "Drishti — AI-driven climate-health early warning",
    description: "See it from space. Confirm it from the sky. Stop it before it spreads.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
