import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOSIGN Meta Ads Reporting",
  description: "Read-only Meta Ads reporting for KOSIGN Music.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
