import "../globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import RootLayout from "@/components/landing-page/main-layout";
interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Book Review Platform",
  description: "Discover and review books you love",
};

export default function LayoutPage({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <RootLayout>{children}</RootLayout>
    </AuthProvider>
  );
}
