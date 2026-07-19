import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unsaid — Practice the conversation before it matters",
  description:
    "Rehearse difficult conversations, face realistic pushback, and replay the moments that changed the outcome.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
