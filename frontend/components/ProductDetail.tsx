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
        {error ? <p className="muted">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="row">
      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <h2>{product.sku}</h2>
        <div className="muted">{product.name}</div>
        <p>
          <b>On hand:</b> {product.onHand} {product.unit}
        </p>
        <p>
          <b>Reorder level:</b> {product.reorderLevel}
        </p>
        <p className="muted">
          <Link href="/products">← Back to products</Link>
        </p>
      </div>

      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <h2>Add Movement</h2>
        <form onSubmit={addMovement} className="row">
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="IN">IN (purchase / received)</option>
            <option value="OUT">OUT (sold / issued)</option>
            <option value="DAMAGED">DAMAGED (write-off)</option>
          </select>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" />
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button disabled={saving}>Save</button>
        </form>
        {error ? <p className="muted">{error}</p> : null}
      </div>

      <div className="card" style={{ flexBasis: "100%" }}>
        <h2>Recent Movements</h2>
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
                <td colSpan={4} className="muted">
                  No movements yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
