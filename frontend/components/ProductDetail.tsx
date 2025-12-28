"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, apiPost, Product, StockMovement } from "./api";

type ProductWithMovements = Product & { movements: StockMovement[] };

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<ProductWithMovements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"IN" | "OUT" | "DAMAGED">("IN");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const p = await apiGet<ProductWithMovements>(`/api/products/${id}`);
    setProduct(p);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [id]);

  async function addMovement(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiPost(`/api/products/${id}/movements`, {
        type,
        quantity: Number(quantity),
        note: note || undefined
      });
      setQuantity("1");
      setNote("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!product) {
    return (
      <div className="card">
        <div className="muted">Loading…</div>
        {error ? <div className="alert" style={{ marginTop: 12 }}>{error}</div> : null}
      </div>
    );
  }

  return (
    <div>
      <div className="pageTitle">{product.sku}</div>
      <div className="pageSub">{product.name}</div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <section className="card col-4">
          <h2>Details</h2>
          <div className="divider" />
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <span className="pill">On hand</span>
            <span style={{ fontSize: 24, fontWeight: 850 }}>
              {product.onHand} <span className="muted">{product.unit}</span>
            </span>
          </div>
          <div className="divider" />
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <span className="pill">Reorder level</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{product.reorderLevel}</span>
          </div>
          <div className="divider" />
          <Link className="link" href="/products">
            ← Back to products
          </Link>
        </section>

        <section className="card col-8">
          <h2>Add Movement</h2>
          <div className="muted">Record stock changes and keep history accurate</div>
          <div className="divider" />
          <form onSubmit={addMovement} className="formGrid">
            <div className="field sm-4">
              <div className="fieldLabel">Type</div>
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="IN">IN (purchase / received)</option>
                <option value="OUT">OUT (sold / issued)</option>
                <option value="DAMAGED">DAMAGED (write-off)</option>
              </select>
            </div>
            <div className="field sm-4">
              <div className="fieldLabel">Quantity</div>
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" />
            </div>
            <div className="field sm-4">
              <div className="fieldLabel">Note</div>
              <input placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="field">
              <button disabled={saving}>{saving ? "Saving…" : "Save movement"}</button>
            </div>
          </form>

          <div className="divider" />
          <h2>Recent Movements</h2>
          <div className="tableWrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {product.movements.map((m) => (
                  <tr key={m.id}>
                    <td className="muted">{new Date(m.createdAt).toLocaleString()}</td>
                    <td>{m.type}</td>
                    <td>{m.quantity}</td>
                    <td className="muted">{m.note ?? "—"}</td>
                  </tr>
                ))}
                {product.movements.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="softNote">No movements yet. Add the first movement above.</div>
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
