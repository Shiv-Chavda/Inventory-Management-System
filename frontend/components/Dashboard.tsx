"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, Product } from "./api";

type DeadStockResponse = {
  days: number;
  since: string;
  items: Product[];
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [dead, setDead] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [all, low, deadResp] = await Promise.all([
          apiGet<Product[]>("/api/products"),
          apiGet<Product[]>("/api/reports/low-stock"),
          apiGet<DeadStockResponse>("/api/reports/dead-stock?days=30")
        ]);
        setProducts(all);
        setLowStock(low);
        setDead(deadResp.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  return (
    <div className="row">
      <div className="card" style={{ flex: 1, minWidth: 300 }}>
        <h2>Inventory Snapshot</h2>
        <div className="muted">Total products: {products.length}</div>
        {error ? <p className="muted">{error}</p> : null}
      </div>

      <div className="card" style={{ flex: 1, minWidth: 300 }}>
        <h2>Low Stock</h2>
        <div className="muted">Below reorder level</div>
        <ul>
          {lowStock.slice(0, 8).map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.id}`}>{p.sku}</Link> — {p.onHand} {p.unit}
            </li>
          ))}
          {lowStock.length === 0 ? <li className="muted">No low-stock items</li> : null}
        </ul>
      </div>

      <div className="card" style={{ flex: 1, minWidth: 300 }}>
        <h2>Dead Stock</h2>
        <div className="muted">No movement in last 30 days</div>
        <ul>
          {dead.slice(0, 8).map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.id}`}>{p.sku}</Link> — {p.onHand} {p.unit}
            </li>
          ))}
          {dead.length === 0 ? <li className="muted">No dead stock</li> : null}
        </ul>
      </div>
    </div>
  );
}
