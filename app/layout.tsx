import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BornHere — Give them the sky they arrived under",
  description: "Recreate the real stars, the song, and the headline from the day someone you love was born.",
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
