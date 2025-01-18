import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import Providers from "./providers";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kopiko",
  description: "Workspace Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

      </head>
      <body className={inter.className}>
        <Providers>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster
                position="bottom-right" />
              <CreateWorkspaceDialog />
            </ThemeProvider>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
