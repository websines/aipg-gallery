import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ImageProvider from "./_providers/ImageProvider";
import NavBarComponent from "@/components/Navs/NavBarComponent";
import { Toaster } from "@/components/ui/toaster";
import FooterNav from "@/components/Navs/FooterNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Gallery",
  description: "Create and explore AI-generated images",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        {/* Background with subtle gradient and pattern */}
        <div className="fixed inset-0 -z-10 h-full w-full">
          <div className="absolute inset-0 bg-[#030712] bg-opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:32px_32px] opacity-25"></div>
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-20"></div>
        </div>
        
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ImageProvider>
            <div className="relative flex flex-col min-h-screen">
              <NavBarComponent />
              <main className="flex-grow pb-20">
                {children}
              </main>
              <FooterNav />
              <Toaster />
            </div>
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
