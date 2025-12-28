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
          <header className="topbar">
            <div className="brand">
              <div className="brandTitle">Inventory Management</div>
              <div className="brandSub">Fast SKU visibility and stock movements</div>
            </div>
            <nav className="nav">
              <Link href="/">Dashboard</Link>
              <Link href="/products">Products</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
