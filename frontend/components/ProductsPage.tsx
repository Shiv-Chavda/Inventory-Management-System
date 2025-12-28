"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, Product } from "./api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("unit");
  const [reorderLevel, setReorderLevel] = useState("0");

  async function refresh() {
    const list = await apiGet<Product[]>("/api/products");
    setProducts(list);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => a.sku.localeCompare(b.sku));
  }, [products]);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiPost<Product>("/api/products", {
        sku,
        name,
        unit,
        reorderLevel: Number(reorderLevel)
      });
      setSku("");
      setName("");
      setReorderLevel("0");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="row">
      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <h2>Create Product</h2>
        <form onSubmit={createProduct} className="row">
          <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Unit (e.g. pcs, kg)" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          <input
            placeholder="Reorder level"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            inputMode="numeric"
          />
          <button disabled={creating}>Create</button>
        </form>
        {error ? <p className="muted">{error}</p> : null}
      </div>

      <div className="card" style={{ flex: 2, minWidth: 520 }}>
        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>On Hand</th>
              <th>Reorder</th>
              <th>Last movement</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/products/${p.id}`}>{p.sku}</Link>
                </td>
                <td>{p.name}</td>
                <td>
                  {p.onHand} {p.unit}
                </td>
                <td>{p.reorderLevel}</td>
                <td className="muted">{p.lastMovementAt ? new Date(p.lastMovementAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No products yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
