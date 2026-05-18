import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProductTwin AI · Simulate product decisions before you ship",
  description:
    "Strategy studio for PMs, founders, and innovation teams. Stress-test pricing, churn, retention, and roadmap decisions in a digital twin of your product.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 bg-grid opacity-[0.35] pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-radial-fade pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
