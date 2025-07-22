import type { Metadata } from "next";
import { Anuphan, Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import Providers from "./providers";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

const anuphan = Anuphan({
  subsets: ["thai"],
  weight: ["100", "300", "400", "700"],
  variable: '--font-anuphan',
});

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
      <body className={`${lato.variable} ${anuphan.variable} font-anuphan`}>
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
