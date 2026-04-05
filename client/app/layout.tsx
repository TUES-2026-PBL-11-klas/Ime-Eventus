import type { Metadata } from "next";
import "../src/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Eventus — School Event Management",
  description: "Platform for managing school events, registrations, and approvals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
