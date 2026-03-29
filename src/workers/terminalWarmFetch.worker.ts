/// <reference lib="webworker" />

type InItem = { i: number; url: string };
type In = { items: InItem[] };
type OutItem = { i: number; ok: boolean; buf?: ArrayBuffer };

self.onmessage = async (e: MessageEvent<In>) => {
  const { items } = e.data;
  const payload: OutItem[] = [];
  const transfers: ArrayBuffer[] = [];

  for (const item of items) {
    try {
      const r = await fetch(item.url, { cache: "force-cache" });
      if (!r.ok) {
        payload.push({ i: item.i, ok: false });
        continue;
      }
      const buf = await r.arrayBuffer();
      payload.push({ i: item.i, ok: true, buf });
      transfers.push(buf);
    } catch {
      payload.push({ i: item.i, ok: false });
    }
  }

  (self as DedicatedWorkerGlobalScope).postMessage({ payload }, transfers);
};

export {};
