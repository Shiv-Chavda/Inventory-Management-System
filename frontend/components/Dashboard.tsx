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

  const totalSkus = products.length;
  const inStockSkus = products.filter((p) => p.onHand > 0).length;
  const outOfStockSkus = products.filter((p) => p.onHand <= 0).length;
  const recentlyMoved = [...products]
    .filter((p) => p.lastMovementAt)
    .sort((a, b) => new Date(b.lastMovementAt as string).getTime() - new Date(a.lastMovementAt as string).getTime())
    .slice(0, 8);

  const worstReorder = [...lowStock]
    .sort((a, b) => (b.reorderLevel - b.onHand) - (a.reorderLevel - a.onHand))
    .slice(0, 8);

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
    <div>
      <div className="pageTitle">Dashboard</div>
      <div className="pageSub">Operations overview — alerts, stock health, and recent activity</div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <section className="card col-3">
          <h2>Total SKUs</h2>
          <div className="divider" />
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="pill">Catalog</span>
            <span style={{ fontSize: 30, fontWeight: 900 }}>{totalSkus}</span>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Active SKUs tracked
          </div>
        </section>

        <section className="card col-3">
          <h2>In Stock</h2>
          <div className="divider" />
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="pill">On-hand &gt; 0</span>
            <span style={{ fontSize: 30, fontWeight: 900 }}>{inStockSkus}</span>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            {outOfStockSkus} out of stock
          </div>
        </section>

        <section className="card col-3">
          <h2>Low Stock Alerts</h2>
          <div className="divider" />
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="pill">Reorder</span>
            <span style={{ fontSize: 30, fontWeight: 900 }}>{lowStock.length}</span>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Below reorder level
          </div>
        </section>

        <section className="card col-3">
          <h2>Dead Stock Alerts</h2>
          <div className="divider" />
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="pill">No movement</span>
            <span style={{ fontSize: 30, fontWeight: 900 }}>{dead.length}</span>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Last 30 days
          </div>
        </section>

        <section className="card col-6">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: 2 }}>Reorder Risk</h2>
              <div className="muted">Most urgent SKUs to restock</div>
            </div>
            <Link className="link" href="/products">
              View all products
            </Link>
          </div>
          <div className="divider" />
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>On Hand</th>
                  <th>Reorder</th>
                  <th>Deficit</th>
                </tr>
              </thead>
              <tbody>
                {worstReorder.map((p) => {
                  const deficit = Math.max(0, p.reorderLevel - p.onHand);
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link className="link" href={`/products/${p.id}`}>
                          {p.sku}
                        </Link>
                      </td>
                      <td>
                        {p.onHand} <span className="muted">{p.unit}</span>
                      </td>
                      <td>{p.reorderLevel}</td>
                      <td>{deficit}</td>
                    </tr>
                  );
                })}
                {worstReorder.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="softNote">No low-stock items right now.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card col-6">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: 2 }}>Recent Activity</h2>
              <div className="muted">Latest SKUs with stock movement</div>
            </div>
            <span className="pill">Top 8</span>
          </div>
          <div className="divider" />
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>On Hand</th>
                  <th>Last movement</th>
                </tr>
              </thead>
              <tbody>
                {recentlyMoved.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="link" href={`/products/${p.id}`}>
                        {p.sku}
                      </Link>
                    </td>
                    <td>
                      {p.onHand} <span className="muted">{p.unit}</span>
                    </td>
                    <td className="muted">{p.lastMovementAt ? new Date(p.lastMovementAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {recentlyMoved.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="softNote">No movement history yet. Add a movement on any product to see activity.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card col-12">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: 2 }}>Dead Stock</h2>
              <div className="muted">SKUs with no movement in the last 30 days</div>
            </div>
            <span className="pill">{dead.length} flagged</span>
          </div>
          <div className="divider" />
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>On Hand</th>
                  <th>Last movement</th>
                </tr>
              </thead>
              <tbody>
                {dead.slice(0, 10).map((p) => (
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
                    <td className="muted">{p.lastMovementAt ? new Date(p.lastMovementAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {dead.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="softNote">No dead stock found for the last 30 days.</div>
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
