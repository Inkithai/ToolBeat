"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";

export default function Client() {
  const [distance, setDistance] = useState(500);
  const [efficiency, setEfficiency] = useState(30);
  const [pricePerGallon, setPricePerGallon] = useState(3.5);
  const [unit, setUnit] = useState<"mpg" | "lpk">("mpg");

  const result = useMemo(() => {
    const gallons = unit === "mpg" ? distance / efficiency : (distance * efficiency) / 100;
    const liters = unit === "mpg" ? gallons * 3.785 : gallons;
    const cost = unit === "mpg" ? gallons * pricePerGallon : gallons * pricePerGallon;
    return { gallons: unit === "mpg" ? gallons : liters, liters: unit === "mpg" ? liters : gallons, cost, perMile: cost / distance, perKm: cost / (distance * 1.609) };
  }, [distance, efficiency, pricePerGallon, unit]);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <IoWorkspace inputLabel="Trip details" outputLabel="Fuel cost" status="complete"
      input={<div className="space-y-3">
        <div className="flex gap-2"><button type="button" onClick={() => setUnit("mpg")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${unit === "mpg" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>MPG (US)</button><button type="button" onClick={() => setUnit("lpk")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${unit === "lpk" ? "bg-indigo-500/20 text-indigo-200" : "border border-white/10 text-ink-400"}`}>L/100km</button></div>
        <label className="space-y-1"><span className="text-xs text-ink-400">Distance ({unit === "mpg" ? "miles" : "km"})</span><input type="number" value={distance} onChange={e => setDistance(+e.target.value)} min={0} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">{unit === "mpg" ? "Fuel efficiency (MPG)" : "Fuel consumption (L/100km)"}</span><input type="number" value={efficiency} onChange={e => setEfficiency(+e.target.value)} min={0} step={0.1} className="field w-full" /></label>
        <label className="space-y-1"><span className="text-xs text-ink-400">{unit === "mpg" ? "Price per gallon ($)" : "Price per liter ($)"}</span><input type="number" value={pricePerGallon} onChange={e => setPricePerGallon(+e.target.value)} min={0} step={0.01} className="field w-full" /></label>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Total fuel cost</p><p className="text-4xl font-bold text-white">${fmt(result.cost)}</p></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Fuel needed</p><p className="text-lg font-bold text-white">{fmt(result.gallons)} {unit === "mpg" ? "gal" : "L"}</p></div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Cost per mile</p><p className="text-lg font-bold text-white">${fmt(result.perMile)}</p></div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-ink-500">Cost per km</p><p className="text-lg font-bold text-white">${fmt(result.perKm)}</p></div>
        </div>
      </div>}
    />
  );
}
