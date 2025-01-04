import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./sidebar/sidebar";
import { AppProvider } from "@/contexts/app-context";

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
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-4">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
