import "../globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <AuthProvider>
          <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
              BookReview
            </h1>

            {children}

            <p className="text-sm text-center text-gray-500 mt-6">
              &copy; {new Date().getFullYear()} BookReview Platform
            </p>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
