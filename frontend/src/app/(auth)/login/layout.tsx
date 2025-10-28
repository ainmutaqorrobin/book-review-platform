import "../../globals.css";
import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          {/* Branding */}
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
            BookReview
          </h1>

          {/* Children will be the login form */}
          {children}

          {/* Optional footer */}
          <p className="text-sm text-center text-gray-500 mt-6">
            &copy; {new Date().getFullYear()} BookReview Platform
          </p>
        </div>
      </body>
    </html>
  );
}
