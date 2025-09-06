import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Property Manager Pro - Professional Property Management",
  description: "Modern property management platform for landlords with professional tools at a fraction of traditional costs.",
  keywords: ["Property Management", "Landlord Tools", "Real Estate", "Property Tech", "Rent Collection"],
  authors: [{ name: "Property Manager Pro Team" }],
  openGraph: {
    title: "Property Manager Pro",
    description: "Professional property management tools for modern landlords",
    url: "https://propertymanagerpro.com",
    siteName: "Property Manager Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Manager Pro",
    description: "Professional property management tools for modern landlords",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
