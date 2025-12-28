import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Inventory",
  description: "Inventory visibility for SKUs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <Link href="/">Dashboard</Link>
            <Link href="/products">Products</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
