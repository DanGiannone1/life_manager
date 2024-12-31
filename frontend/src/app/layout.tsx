import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./sidebar/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life Manager",
  description: "Manage your life efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="relative min-h-screen">
          <div className="fixed inset-y-0 z-50 hidden w-72 flex-col md:flex">
            <Sidebar />
          </div>
          <main className="flex-1 md:pl-72">
            <div className="container mx-auto p-8 pt-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
