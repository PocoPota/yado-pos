import type { Metadata } from "next";
import "./globals.scss";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "YadoPOS | やどかり祭用POSシステム",
  description: "やどかり祭用POSシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
