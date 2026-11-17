"use client";

import { LuPrinter } from "react-icons/lu";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-ghost">
      <LuPrinter size={16} /> Save as PDF
    </button>
  );
}
