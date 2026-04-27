"use client";

import type { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'red' | 'green' | 'gray' | 'yellow';
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const styles = {
    blue: {
      cardBg: 'bg-linear-to-br from-[#e3e9ff] to-[#f5f7ff]',
      iconBg: 'bg-linear-to-br from-[#487bff] to-[#3550ff]',
      valueColor: 'text-[#1d3cff]',
    },
    red: {
      cardBg: 'bg-linear-to-br from-[#ffe2f0] to-[#fff4f7]',
      iconBg: 'bg-linear-to-br from-[#ff2f6b] to-[#ff5b1f]',
      valueColor: 'text-[#f43f5e]',
    },
    green: {
      cardBg: 'bg-linear-to-br from-[#ddffeb] to-[#f4fff8]',
      iconBg: 'bg-linear-to-br from-[#22c55e] to-[#16a34a]',
      valueColor: 'text-[#16a34a]',
    },
    gray: {
      cardBg: 'bg-gray-50',
      iconBg: 'bg-gray-600',
      valueColor: 'text-gray-700',
    },
    yellow: {
      cardBg: 'bg-linear-to-br from-[#fff4e5] to-[#fffaf2]',
      iconBg: 'bg-linear-to-br from-[#f97316] to-[#ea580c]',
      valueColor: 'text-[#ea580c]',
    },
  }[color];

  return (
    <div
      className={`${styles.cardBg} col-span-1 rounded-[26px] px-7 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.12)]`}
    >
      <div className="flex flex-col gap-4">
        <div
          className={`${styles.iconBg} inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className={`mt-2 text-3xl font-extrabold ${styles.valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
