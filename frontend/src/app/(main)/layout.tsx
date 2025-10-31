import "../globals.css";
import { ReactNode } from "react";
import RootLayout from "@/components/landing-page/main-layout";
interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Book Review Platform",
  description: "Discover and review books you love",
};

export default function LayoutPage({ children }: RootLayoutProps) {
  return <RootLayout>{children}</RootLayout>;
}
