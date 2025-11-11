"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommonHeaders() {
  const [brand, setBrand] = useState("MC");

  const headers = [
    "Description of Promotion",
    "Promotional Period",
    "Eligibility",
    "Action Required",
    "Claiming Promotional Offer",
    "Registration Procedures",
    "Limitations on Participation",
    "Wagering Requirements / Exclusions",
    "Order of Funds Used for Wagering",
    "Eligible Games",
    "Restrictions on Withdrawals",
    "Cancellation",
    "Gambling Problem",
    "Important Terms",
  ];

  const formatHeader = (text: string) => {
    const capsUnderlineBrands = ["MS", "BS"];
    const titleCaseBrands = ["MC", "MP", "BC", "BP", "PC", "PP", "WOF"];

    if (capsUnderlineBrands.includes(brand)) {
      return (
        <h4
          key={text}
          className="underline font-bold text-lg tracking-wide mb-2"
        >
          {text.toUpperCase()}
        </h4>
      );
    }

    if (titleCaseBrands.includes(brand)) {
      const titleCase = text
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return (
        <h4 key={text} className="font-bold text-lg mb-2">
          {titleCase}
        </h4>
      );
    }

    return (
      <h4 key={text} className="font-semibold mb-2">
        {text}
      </h4>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-[45vw] flex flex-col">
      {/* Header + Brand Select */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Common Headers</h3>

        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-32 border border-slate-300">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MC">MC</SelectItem>
            <SelectItem value="MS">MS</SelectItem>
            <SelectItem value="MP">MP</SelectItem>
            <SelectItem value="BC">BC</SelectItem>
            <SelectItem value="BS">BS</SelectItem>
            <SelectItem value="BP">BP</SelectItem>
            <SelectItem value="PC">PC</SelectItem>
            <SelectItem value="PP">PP</SelectItem>
            <SelectItem value="WOF">WOF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Headers Preview */}
      <div className="border rounded-lg p-4 bg-slate-50 overflow-auto max-h-[50vh]">
        {headers.map((header) => formatHeader(header))}
      </div>
    </div>
  );
}
