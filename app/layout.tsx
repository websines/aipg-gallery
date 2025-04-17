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
        {/* Enhanced background with subtle gradients */}
        <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
          {/* Base background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>
          
          {/* Top-right gradient */}
          <div className="absolute top-0 right-0 w-[80vw] h-[50vh] bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl opacity-30"></div>
          
          {/* Top-left gradient */}
          <div className="absolute top-0 left-0 w-[50vw] h-[40vh] bg-gradient-to-br from-blue-600/5 via-indigo-700/10 to-transparent blur-3xl opacity-20"></div>
          
          {/* Bottom-right gradient */}
          <div className="absolute bottom-0 right-0 w-[60vw] h-[60vh] bg-gradient-to-tl from-fuchsia-600/5 via-purple-600/10 to-transparent blur-3xl opacity-20"></div>
          
          {/* Bottom-left gradient */}
          <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-gradient-to-tr from-indigo-900/10 via-violet-700/10 to-transparent blur-3xl opacity-20"></div>
        </div>
        
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ImageProvider>
            <div className="relative flex flex-col min-h-screen">
              <NavBarComponent />
              <main className="flex-grow pt-16">
                {children}
              </main>
              <Toaster />
            </div>
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
