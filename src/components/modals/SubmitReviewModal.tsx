"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { submitReview } from "@/services/reviews";

export function SubmitReviewModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await submitReview({ customerName, rating, comment });
      toast.success("Thank you! Your review has been submitted for approval.");
      setCustomerName("");
      setComment("");
      setRating(5);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[#d5b16a]/30 bg-[#0a0a0a] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-[#f3e8c7]/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="font-serif text-3xl text-[#f5d79e]">Share Your Experience</h2>
          <p className="mt-2 text-xs uppercase tracking-widest text-[#d5b16a]/60">Your feedback helps us maintain our royal standards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5b16a]">Select Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      (hover || rating) >= star
                        ? "fill-[#d5b16a] text-[#d5b16a]"
                        : "text-[#d5b16a]/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/80 px-1">Full Name</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-[#d5b16a]/20 bg-[#111111] px-5 py-3.5 text-sm text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a]/60 focus:bg-[#151515]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/80 px-1">Your Review</label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your royal experience..."
                rows={4}
                className="w-full rounded-2xl border border-[#d5b16a]/20 bg-[#111111] px-5 py-3.5 text-sm text-[#f3e8c7] outline-none transition-all focus:border-[#d5b16a]/60 focus:bg-[#151515] resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d5b16a] py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#f5d79e] hover:shadow-[0_10px_30px_rgba(213,177,106,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit Royal Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
