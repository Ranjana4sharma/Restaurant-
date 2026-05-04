"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteReviewAdmin, fetchReviewsAdmin, updateReviewAdmin } from "@/services/reviews";
import type { ReviewDTO } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await fetchReviewsAdmin());
      setMsg(null);
    } catch {
      setMsg("Failed to load reviews. Please sign in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggleApprove = async (r: ReviewDTO) => {
    try {
      await updateReviewAdmin({ id: r._id, approved: !r.approved });
      await load();
    } catch {
      setMsg("Could not update review status.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await deleteReviewAdmin(id);
      await load();
    } catch {
      setMsg("Could not delete review.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <p className="text-sm text-[#f3e8c7]/70">
          Approve reviews to show them on the public home page.
        </p>
      </div>
      {msg && <p className="rounded-xl bg-[#d5b16a]/10 border border-[#d5b16a]/20 px-4 py-3 text-sm text-[#d5b16a]">{msg}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[#d5b16a]/20 bg-[#111111] shadow-sm">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="bg-[#0a0a0a] text-xs uppercase text-[#d5b16a]/70">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#d5b16a]/70">
                  Loading…
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#d5b16a]/70">
                  No reviews yet.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id} className="border-t border-[#d5b16a]/10 align-top">
                  <td className="px-4 py-3 font-semibold">{r.customerName}</td>
                  <td className="px-4 py-3 text-amber-600">{"★".repeat(r.rating)}</td>
                  <td className="px-4 py-3 text-[#f3e8c7]">{r.comment}</td>
                  <td className="px-4 py-3">
                    {r.approved ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                        Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleApprove(r)}
                      className="mr-2 text-[#e60000] hover:underline"
                    >
                      {r.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r._id)}
                      className="text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
