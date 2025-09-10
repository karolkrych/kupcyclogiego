import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, RefreshCcw, Scale, Coins, ShoppingCart, PackageSearch } from "lucide-react";
import pergamin from "./assets/pergamin.svg";
import leftPOV from "./assets/leftpov.png";
import rightPOV from "./assets/rightpov.png";


/**
 * Kupcy Baniaka – single-file React UI
 * TailwindCSS + shadcn/ui ready. Works as a drop-in component.
 * Props:
 *  - apiUrl: string (endpoint returning the JSON described by the user)
 *
 * Styling goal: pseudo‑medieval fantasy bazaar on parchment.
 */

const frame = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Section = ({ title, icon, children }) => (
  <motion.section
    variants={frame}
    initial="hidden"
    animate="show"
    style={{ backgroundImage: `url(${pergamin})` }}
    className="relative rounded-2xl border border-amber-900/40 bg-amber-100 bg-repeat [background-size:220px_220px] p-4 md:p-6 shadow-sm
               before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none
               before:shadow-[inset_0_0_0_1px_rgba(120,53,15,0.2),inset_0_12px_28px_rgba(120,53,15,0.08)]"
  >
    <div className="mb-4 flex items-center gap-3 text-amber-900">
      <div className="shrink-0 rounded-xl bg-amber-900/10 p-2">{icon}</div>
      <h2 className="font-serif text-2xl md:text-3xl tracking-tight drop-shadow-sm">
        {title}
      </h2>
    </div>
    <div>{children}</div>
  </motion.section>
);


function formatNum(n) {
  return Number(n).toLocaleString("pl-PL", { maximumFractionDigits: 2 });
}

// === MODYFIKATORY CEN ===
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const parseMod = (s) => {
  if (typeof s === "number") return Math.round(s);
  const m = String(s || "0").match(/[-+]?[\d]+/);
  return m ? Number(m[0]) : 0;
};
const fmtMod = (m) => `${m >= 0 ? "+" : ""}${m}%`;
const realFrom = (market, mod) => Number(market) * (1 + Number(mod) / 100);


// --- Waluta: 1 zk = 20 ss ---
const SS_PER_ZK = 20;

function partsFromBuckets(b) {
  const zk = Number(b?.zk || 0);
  const ss = Number(b?.ss || 0);
  const totalSs = Math.round(zk * SS_PER_ZK + ss);
  const negative = totalSs < 0;
  const abs = Math.abs(totalSs);
  return { negative, zk: Math.floor(abs / SS_PER_ZK), ss: abs % SS_PER_ZK };
}

function formatBucketsAsZkSs(b) {
  const { negative, zk, ss } = partsFromBuckets(b);
  const parts = [];
  if (zk) parts.push(`${zk} zk`);
  if (ss) parts.push(`${ss} ss`);
  if (!zk && !ss) parts.push("0");
  return (negative ? "−" : "") + parts.join(" ");
}

function coinBadge(text) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/30 bg-amber-100/60 px-2 py-0.5 text-sm text-amber-900">
      <Coins className="h-4 w-4" /> {text}
    </span>
  );
}

function coinSpan(value, unit) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/30 bg-amber-100/60 px-2 py-0.5 text-sm text-amber-900">
      <Coins className="h-4 w-4" /> {formatNum(value)} {unit}
    </span>
  );
}

function QtyInput({ value, onChange, max }) {
  const dec = () => onChange(Math.max(0, (value || 0) - 1));
  const inc = () => onChange(Math.min(max ?? Infinity, (value || 0) + 1));
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={dec}
        className="rounded-xl border border-amber-900/30 p-1 hover:bg-amber-900/5"
        title="Mniej"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        inputMode="numeric"
        className="w-20 rounded-xl border border-amber-900/30 bg-amber-50/60 px-2 py-1 text-center [font-variant-numeric:tabular-nums] focus:outline-none focus:ring-2 focus:ring-amber-400"
        value={String(value ?? 0)}
        onChange={(e) => {
          const v = Math.max(0, Math.min(Number(e.target.value || 0), max ?? Infinity));
          onChange(isNaN(v) ? 0 : v);
        }}
      />
      <button
        type="button"
        onClick={inc}
        className="rounded-xl border border-amber-900/30 p-1 hover:bg-amber-900/5"
        title="Więcej"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

const ParchmentTable = ({ columns, rows, footer }) => (
  <div className="overflow-x-auto rounded-xl border border-amber-900/30 bg-amber-50">
    <table className="min-w-full text-sm">
      <thead className="bg-amber-200/50">
        <tr>
          {columns.map((c, i) => (
            <th key={i} className="px-3 py-2 text-left font-semibold text-amber-900">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i % 2 ? "bg-amber-50" : "bg-amber-100/40"}>
            {r.map((cell, j) => (
              <td key={j} className="px-3 py-2 align-middle text-amber-900">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
      {footer && (
        <tfoot className="bg-amber-200/50">
          <tr>
            <td colSpan={columns.length} className="px-3 py-2 text-right text-amber-900">
              {footer}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);

const sample = {
  buy_offers: [
    { market_price: "16", modifier_display: "+10%", name: "Kusze", price_unit: "zk", quantity: 76, real_price: "17.6", unit: "1 szt." },
    { market_price: "15", modifier_display: "-10%", name: "Świece", price_unit: "zk", quantity: 52, real_price: "13.5", unit: "100 szt" },
    { market_price: "5", modifier_display: "+10%", name: "Mleko", price_unit: "zk", quantity: 58, real_price: "5.5", unit: "beczka 50 l" },
    { market_price: "5", modifier_display: "+20%", name: "Kamień", price_unit: "zk", quantity: 80, real_price: "6.0", unit: "1 tona" },
    { market_price: "30", modifier_display: "-20%", name: "Ubrania materiałowe", price_unit: "zk", quantity: 56, real_price: "24.0", unit: "10 kg" },
    { market_price: "5", modifier_display: "-20%", name: "Ser", price_unit: "zk", quantity: 45, real_price: "4.0", unit: "kwintal (q/100 kg)" },
  ],
  for_sell: [
    { market_price: "8", modifier_display: "-10%", name: "Piasek", price_unit: "zk", quantity: 62, real_price: "7.2", unit: "1 tona", weight: 1000 },
    { market_price: "90", modifier_display: "+0%", name: "Szkło", price_unit: "zk", quantity: 47, real_price: "90", unit: "100 kg", weight: 100 },
    { market_price: "5", modifier_display: "-10%", name: "Zboże", price_unit: "ss", quantity: 56, real_price: "4.5", unit: "kwintal (q/100 kg)", weight: 100 },
    { market_price: "2", modifier_display: "-10%", name: "Futra i skóry", price_unit: "zk", quantity: 80, real_price: "1.8", unit: "10 kg", weight: 10 },
    { market_price: "15", modifier_display: "-10%", name: "Orzechy", price_unit: "zk", quantity: 33, real_price: "13.5", unit: "kwintal (q/100 kg)", weight: 100 },
    { market_price: "30", modifier_display: "+0%", name: "Warzywa", price_unit: "ss", quantity: 75, real_price: "30", unit: "kwintal (q/100 kg)", weight: 100 },
  ],
  total_weight: 83900,
};

export default function MerchantBazaar({ apiUrl = "https://karolkrych.pythonanywhere.com/" }) {
  const [data, setData] = useState(sample);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Transaction state
  const [buyQty, setBuyQty] = useState({}); // player buys merchant's goods (for_sell)
  const [sellQty, setSellQty] = useState({}); // player sells goods to merchant (buy_offers)

    // % dla wierszy: osobno dla sekcji "for_sell" i "buy_offers"
  const [modsSell, setModsSell] = useState([]); // indeks = idx z data.for_sell
  const [modsBuy, setModsBuy]   = useState([]); // indeks = idx z data.buy_offers

  // Ustaw wartości startowe po każdym wczytaniu danych
  useEffect(() => {
    setModsSell(data.for_sell.map((g) => parseMod(g.modifier_display)));
    setModsBuy(data.buy_offers.map((g) => parseMod(g.modifier_display)));
  }, [data]);

  // Handlery +/- (krok 1%)
  const changeSellMod = (idx, delta) =>
    setModsSell((arr) => {
      const next = [...arr];
      const cur = Number(next[idx] ?? parseMod(data.for_sell[idx]?.modifier_display));
      next[idx] = clamp(cur + delta, -90, 200);
      return next;
    });

  const changeBuyMod = (idx, delta) =>
    setModsBuy((arr) => {
      const next = [...arr];
      const cur = Number(next[idx] ?? parseMod(data.buy_offers[idx]?.modifier_display));
      next[idx] = clamp(cur + delta, -90, 200);
      return next;
    });


  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Błąd pobierania danych");
      const json = await res.json();
      setData(json);
      setBuyQty({});
      setSellQty({});
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load once; if it fails we keep the sample.
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ile płacisz kupcowi za jego towary (sekcja for_sell)
  const payTotals = useMemo(() => {
    const sum = { zk: 0, ss: 0 };
    data.for_sell.forEach((item, idx) => {
      const q = Number(buyQty[idx] || 0);
      const mod = Number(modsSell[idx] ?? parseMod(item.modifier_display));
      const price = realFrom(item.market_price, mod); // ZAMIANA
      const v = q * price;
      if (item.price_unit === "zk") sum.zk += v;
      else sum.ss += v;
    });
    return sum;
  }, [data, buyQty, modsSell]);
  

  // ile kupiec płaci Tobie za Twoje towary (sekcja buy_offers)
  const receiveTotals = useMemo(() => {
    const sum = { zk: 0, ss: 0 };
    data.buy_offers.forEach((item, idx) => {
      const q = Number(sellQty[idx] || 0);
      const mod = Number(modsBuy[idx] ?? parseMod(item.modifier_display));
      const price = realFrom(item.market_price, mod); // ZAMIANA
      const v = q * price;
      if (item.price_unit === "zk") sum.zk += v;
      else sum.ss += v;
    });
    return sum;
  }, [data, sellQty, modsBuy]);
  

  // bilans = receive − pay (w szelągach i z powrotem)
  const netTotals = useMemo(() => {
    const toSs = (b) => Math.round((Number(b.zk || 0) * SS_PER_ZK) + Number(b.ss || 0));
    const diffSs = toSs(receiveTotals) - toSs(payTotals);
    return { zk: diffSs / SS_PER_ZK, ss: 0 }; // formatter zamieni na X zk Y ss
  }, [receiveTotals, payTotals]);

  const totalWeightBuy = useMemo(() => {
    let w = 0;
    data.for_sell.forEach((item, idx) => {
      const q = buyQty[idx] || 0;
      w += (item.weight || 0) * q;
    });
    return w;
  }, [data, buyQty]);

  return (
    <div className="relative">
      {/* TŁO – pełny ekran */}
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: "#5b3b2a",
          backgroundImage:
            "repeating-linear-gradient(90deg, #6b442c 0 180px, #734a31 180px 184px)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 z-[1] bg-[radial-gradient(70%_60%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_100%)]"
      />
  
      {/* OBRAZY POV PO BOKACH – ponad tłem, pod UI */}
      <img
        src={leftPOV}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none select-none fixed left-0 bottom-[-8vh] hidden lg:block h-[125vh] max-w-none object-contain z-[2] drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)]"
      />
      <img
        src={rightPOV}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none select-none fixed right-0 bottom-[-8vh] hidden lg:block h-[125vh] max-w-none object-contain z-[2] drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)]"
      />
  
      {/* BLOK CENTRALNY – interfejs na środku */}
      <main className="relative z-[10] flex min-h-screen w-screen items-center justify-center px-3 sm:px-6">
        <div className="w-full max-w-6xl p-4 md:p-8">
          {/* Header */}
          <motion.header
            variants={frame}
            initial="hidden"
            animate="show"
            className="mb-6 rounded-3xl border border-amber-900/40 bg-gradient-to-b from-amber-100 to-amber-50 p-5 shadow"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-amber-950 drop-shadow-sm">
                  Kupcy Baniaka – Targ Miejski
                </h1>
                <p className="mt-1 text-amber-900/80">
                  Wieści niosą ceny dnia. Targowisko szumi jak las – targuj się
                  mądrze!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-900/40 bg-amber-100/50 px-3 py-2 text-amber-900 hover:bg-amber-200/60"
                >
                  <RefreshCcw className="h-4 w-4" /> Odśwież
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-amber-900">
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-900/30 bg-amber-100/70 px-3 py-1.5">
                <Scale className="h-4 w-4" /> Waga karawany kupca:{" "}
                {formatNum(data.total_weight)} kg
              </div>
              {coinBadge(formatBucketsAsZkSs(netTotals))}
            </div>
            {loading && <p className="mt-3 text-amber-900">Ładowanie danych z targu...</p>}
            {!!error && (
              <p className="mt-3 text-red-800">{error} – pokazano przykładowe dane.</p>
            )}
          </motion.header>
  
          {/* Merchant sells to player */}
          <Section title="Kupiec oferuje" icon={<PackageSearch className="h-5 w-5" />}>
            <ParchmentTable
              columns={[
                "Towar",
                "Cena rynkowa (za sztukę)",
                "Cena rzeczywista",
                "Dostępność",
                "Transakcja",
              ]}
              rows={data.for_sell.map((g, idx) => [
                <div className="flex flex-col">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-xs text-amber-900/70">{g.unit}</span>
                </div>,
                <div className="flex items-center gap-2">
                  {coinSpan(g.market_price, g.price_unit)}
                </div>,
                <div className="flex items-center gap-2">
                {(() => {
                  const mod = Number(modsSell[idx] ?? parseMod(g.modifier_display));
                  const price = realFrom(g.market_price, mod);
                  return (
                    <>
                      {coinSpan(price, g.price_unit)}
                      <div className="ml-1 inline-flex items-center rounded-lg border border-amber-900/30 bg-amber-100/60">
                        <button
                          type="button"
                          onClick={() => changeSellMod(idx, -10)}
                          className="px-1.5 py-0.5 text-xs hover:bg-amber-900/10"
                          title="Mniejszy modyfikator"
                        >
                          −
                        </button>
                        <span className="px-1.5 text-xs w-12 text-center">{fmtMod(mod)}</span>
                        <button
                          type="button"
                          onClick={() => changeSellMod(idx, +10)}
                          className="px-1.5 py-0.5 text-xs hover:bg-amber-900/10"
                          title="Większy modyfikator"
                        >
                          +
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>,
                formatNum(g.quantity),
                <QtyInput
                  value={buyQty[idx] || 0}
                  onChange={(v) => setBuyQty((s) => ({ ...s, [idx]: v }))}
                  max={g.quantity}
                />,
              ])}
              footer={
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <span className="text-sm">Waga zakupów: {formatNum(totalWeightBuy)} kg</span>
                  <span className="ml-2 text-sm">
                    Do zapłaty kupcowi: {coinBadge(formatBucketsAsZkSs(payTotals))}
                  </span>
                </div>
              }
            />
          </Section>
  
          {/* Player sells to merchant */}
          <div className="h-6" />
          <Section title="Kupiec chce kupić" icon={<ShoppingCart className="h-5 w-5" />}>
            <ParchmentTable
              columns={[
                "Towar",
                "Cena rynkowa (maksymalna)",
                "Cena rzeczywista (maks.)",
                "Ilość",
                "Transakcja",
              ]}
              rows={data.buy_offers.map((g, idx) => [
                <div className="flex flex-col">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-xs text-amber-900/70">{g.unit}</span>
                </div>,
                coinSpan(g.market_price, g.price_unit),
                <div className="flex items-center gap-2">
                  {(() => {
                    const mod = Number(modsBuy[idx] ?? parseMod(g.modifier_display));
                    const price = realFrom(g.market_price, mod);
                    return (
                      <>
                        {coinSpan(price, g.price_unit)}
                        <div className="ml-1 inline-flex items-center rounded-lg border border-amber-900/30 bg-amber-100/60">
                          <button
                            type="button"
                            onClick={() => changeBuyMod(idx, -1)}
                            className="px-1.5 py-0.5 text-xs hover:bg-amber-900/10"
                            title="Mniejszy modyfikator"
                          >
                            −
                          </button>
                          <span className="px-1.5 text-xs w-12 text-center">{fmtMod(mod)}</span>
                          <button
                            type="button"
                            onClick={() => changeBuyMod(idx, +1)}
                            className="px-1.5 py-0.5 text-xs hover:bg-amber-900/10"
                            title="Większy modyfikator"
                          >
                            +
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>,
                formatNum(g.quantity),
                <QtyInput
                  value={sellQty[idx] || 0}
                  onChange={(v) => setSellQty((s) => ({ ...s, [idx]: v }))}
                  max={g.quantity}
                />,
              ])}
              footer={
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <span className="text-sm">Należność dla Ciebie:</span>
                  {coinBadge(formatBucketsAsZkSs(receiveTotals))}
                </div>
              }
            />
          </Section>
  
          <footer className="mt-8 text-center text-xs text-amber-800/80">
            <p>© Karczma „Sen o Moksymilianie”. Interfejs inspirowany pergaminem i Lochportem.</p>
          </footer>
        </div>
      </main>
    </div>
  );  
}