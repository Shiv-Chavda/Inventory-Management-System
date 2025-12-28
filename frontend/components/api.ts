export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  reorderLevel: number;
  onHand: number;
  createdAt: string;
  updatedAt: string;
  lastMovementAt?: string | null;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "DAMAGED";
  quantity: number;
  note?: string | null;
  createdAt: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
