import "../globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import RootLayout from "@/components/landing-page/main-layout";
interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Book Review Platform",
  description: "Discover and review books you love",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function LayoutPage({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <RootLayout>{children}</RootLayout>
    </AuthProvider>
  );
}
