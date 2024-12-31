import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TaskProvider } from "@/contexts/task-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life Manager",
  description: "Manage your tasks and goals effectively",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TaskProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-8">
              {children}
            </main>
          </div>
        </TaskProvider>
      </body>
    </html>
  );
}
