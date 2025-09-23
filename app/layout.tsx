import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Navbar } from "@/components/ui/navbar";
import { ContentProvider } from "@/lib/content-context";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "Waltics",
  description: "Walrus Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ContentProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </ContentProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
