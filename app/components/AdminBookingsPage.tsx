"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { PortalShell } from "@/app/components/PortalShell";

type Booking = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
type Status = "All" | "Pending" | "Reviewed" | "Approved" | "Rejected";

const statusStyles: Record<string, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-600",
  Reviewed: "border-blue-200 bg-blue-50 text-blue-600",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-600",
  Rejected: "border-red-200 bg-red-50 text-red-600",
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status>("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewStatus, setReviewStatus] = useState("Reviewed");
  const counts = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking[6] === "Pending").length,
    approved: bookings.filter((booking) => booking[6] === "Approved").length,
    rejected: bookings.filter((booking) => booking[6] === "Rejected").length,
  };

  const visibleBookings = bookings.filter(
    (booking) =>
      (filter === "All" || booking[6] === filter) &&
      booking.join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    fetch("/api/bookings")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.data))
          setBookings(
            result.data.map(
              (item: {
                id: string;
                name: string;
                contact: string;
                plan: string;
                preferredDate: string;
                submittedAt: string;
                status: string;
                email: string;
              }) => [
                item.id,
                item.name,
                item.contact,
                item.plan.replace("_", " "),
                item.preferredDate.slice(0, 10),
                item.submittedAt.slice(0, 10),
                item.status,
                item.email,
              ],
            ),
          );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const table = document.querySelector('table[class*="min-w-[1100px]"]');
    const toolbar = table?.closest(".mt-4")?.previousElementSibling;
    if (!toolbar) return;
    toolbar
      .querySelectorAll(".installation-record-counter")
      .forEach((node) => node.remove());
    toolbar.querySelectorAll(".live-record-counter").forEach((node, index) => {
      if (index > 0) node.remove();
    });
    let counter = toolbar.querySelector<HTMLSpanElement>(
      ".live-record-counter",
    );
    if (!counter) {
      counter = document.createElement("span");
      counter.className = "live-record-counter ml-auto text-sm text-slate-400";
      toolbar.appendChild(counter);
    }
    counter.textContent = `${visibleBookings.length} records`;
  }, [visibleBookings.length]);

  async function saveReview() {
    if (!selectedBooking) return;
    try {
      await fetch(`/api/bookings/${selectedBooking[0]}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: reviewStatus }),
      });
    } finally {
      setBookings((current) =>
        current.map((booking) =>
          booking[0] === selectedBooking[0]
            ? [
                booking[0],
                booking[1],
                booking[2],
                booking[3],
                booking[4],
                booking[5],
                reviewStatus,
                booking[7],
              ]
            : booking,
        ),
      );
      setSelectedBooking(null);
    }
  }

  return (
    <PortalShell role="admin">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage incoming booking requests
        </p>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["TOTAL", counts.total],
          ["PENDING", counts.pending],
          ["APPROVED", counts.approved],
          ["REJECTED", counts.rejected],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-slate-200 bg-white px-6 py-5"
            key={label}
          >
            <p className="text-xs font-bold tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3b4fd8]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(
            ["All", "Pending", "Reviewed", "Approved", "Rejected"] as Status[]
          ).map((option) => (
            <button
              onClick={() => setFilter(option)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${filter === option ? "border-[#2447b6] bg-[#2447b6] text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              key={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr>
                {[
                  "Ref #",
                  "Applicant",
                  "Contact",
                  "Plan",
                  "Preferred date",
                  "Submitted",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th className="px-5 py-4" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {visibleBookings.map((booking) => (
                <tr className="border-t border-slate-100" key={booking[0]}>
                  <td className="px-5 py-4 text-slate-900">
                    {booking[0]}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {booking[1]}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{booking[2]}</td>
                  <td className="px-5 py-4 text-slate-500">{booking[3]}</td>
                  <td className="px-5 py-4 text-slate-500">{booking[4]}</td>
                  <td className="px-5 py-4 text-slate-500">{booking[5]}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${statusStyles[booking[6]]}`}
                    >
                      {booking[6]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setReviewStatus(
                          booking[6] === "Pending" ? "Reviewed" : booking[6],
                        );
                      }}
                      className="text-xs font-semibold text-[#2563eb]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5"
          onMouseDown={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold">Review Request</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold">{selectedBooking[1]}</p>
                <p className="mt-1 text-slate-500">
                  {selectedBooking[2]} · {selectedBooking[3]}
                </p>
                <p className="mt-1 text-slate-500">
                  Preferred date: {selectedBooking[4]}
                </p>
                <p className="mt-1 text-slate-500">{selectedBooking[7]}</p>
              </div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
                <select
                  value={reviewStatus}
                  onChange={(event) => setReviewStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"
                >
                  <option>Pending</option>
                  <option>Reviewed</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={saveReview}
                className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
