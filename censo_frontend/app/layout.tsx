import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Sistema de Encuestas - CONATEL",
//   description: "Encuestas de Infraestructura y Vías Generales de Telecomunicaciones",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={``}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
