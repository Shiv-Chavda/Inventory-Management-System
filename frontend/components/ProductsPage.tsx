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
    <div>
      <div className="pageTitle">Products</div>
      <div className="pageSub">Create SKUs and track on-hand quantity</div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <section className="card col-4">
          <h2>Create Product</h2>
          <div className="muted">Add a new SKU to your catalog</div>
          <div className="divider" />
          <form onSubmit={createProduct} className="formGrid">
            <div className="field sm-6">
              <div className="fieldLabel">SKU</div>
              <input placeholder="e.g. SKU-001" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div className="field sm-6">
              <div className="fieldLabel">Name</div>
              <input placeholder="e.g. Wireless Mouse" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field sm-6">
              <div className="fieldLabel">Unit</div>
              <input placeholder="e.g. pcs, kg" value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </div>
            <div className="field sm-6">
              <div className="fieldLabel">Reorder level</div>
              <input value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} inputMode="numeric" />
            </div>
            <div className="field">
              <button disabled={creating}>{creating ? "Creating…" : "Create product"}</button>
            </div>
          </form>
        </section>

        <section className="card col-8">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: 2 }}>Products</h2>
              <div className="muted">{sorted.length} total</div>
            </div>
            <span className="pill">Sorted by SKU</span>
          </div>
          <div className="divider" />

          <div className="tableWrap">
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
                      <Link className="link" href={`/products/${p.id}`}>
                        {p.sku}
                      </Link>
                    </td>
                    <td>{p.name}</td>
                    <td>
                      {p.onHand} <span className="muted">{p.unit}</span>
                    </td>
                    <td>{p.reorderLevel}</td>
                    <td className="muted">{p.lastMovementAt ? new Date(p.lastMovementAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="softNote">No products yet. Create your first SKU using the form.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
