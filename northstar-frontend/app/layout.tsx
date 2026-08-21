import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Northstar Homes — Chat with Riya",
  description: "Talk to Riya about Project Northstar One, Sector 79, Gurugram.",
};

// Tells the browser to render native UI (scrollbars, form controls) dark too.
export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` is applied permanently here — globals.css defines the dark variant
    // as `&:is(.dark *)`, so every descendant resolves the dark token set.
    // h-full + overflow-hidden give the chat card a bounded viewport to size
    // against, so the page itself never scrolls.
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
