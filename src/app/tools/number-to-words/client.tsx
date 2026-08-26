"use client";
import { useState } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const ONES = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
const SCALES = ["","thousand","million","billion","trillion","quadrillion"];
function chunk(n: number): string {
  if (n === 0) return "";
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n/100)]} hundred`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n/10)]); if (n%10) parts.push(ONES[n%10]); }
  else if (n > 0) { parts.push(ONES[n]); }
  return parts.join(" ");
}
function numberToWords(num: number): string {
  if (num === 0) return "zero";
  const negative = num < 0; num = Math.abs(num);
  if (num !== Math.floor(num)) return "Decimal numbers not supported";
  let result = ""; let scaleIndex = 0;
  while (num > 0) {
    const chunkVal = num % 1000;
    if (chunkVal > 0) { const words = chunk(chunkVal); result = words + (SCALES[scaleIndex] ? ` ${SCALES[scaleIndex]}` : "") + (result ? ` ${result}` : ""); }
    num = Math.floor(num / 1000); scaleIndex++;
  }
  return (negative ? "negative " : "") + result;
}
export default function Client() {
  const [input, setInput] = useState("12345");
  const num = parseInt(input) || 0;
  const words = numberToWords(num);
  return (
    <IoWorkspace inputLabel="Number" outputLabel="In words" status={words ? "complete" : "idle"}
      input={<input type="number" value={input} onChange={e => setInput(e.target.value)} className="field w-full text-2xl" placeholder="Enter a number" />}
      output={<div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-6 text-center"><p className="text-2xl font-bold capitalize text-white">{words || "Enter a number"}</p></div>}
    />
  );
}
