import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ImageProvider from "./_providers/ImageProvider";
import NavBarComponent from "@/components/Navs/NavBarComponent";
import { Toaster } from "@/components/ui/toaster";
import FooterNav from "@/components/Navs/FooterNav";

const oswald = Oswald({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIPG Gallery",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${oswald.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ImageProvider>
            <NavBarComponent />
            {children}
            <FooterNav />
            <Toaster />
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
