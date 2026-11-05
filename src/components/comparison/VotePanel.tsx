"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VoteButtons, type VoteValue } from "./VoteButtons";
import { VoteBreakdown } from "./VoteBreakdown";
import { MIN_VOTES_FOR_VERDICT, type VoteCounts } from "@/lib/verdict";

interface VotePanelProps {
  comparisonId: string;
  slug: string;
  genericBrand: string;
  nameBrand: string;
  initialCounts: VoteCounts;
}

const PENDING_VOTE_KEY = (id: string) => `genericornot:pendingVote:${id}`;

function readPendingVote(comparisonId: string): VoteValue | null {
  try {
    const value = window.sessionStorage.getItem(PENDING_VOTE_KEY(comparisonId));
    return value === "SAME_QUALITY" || value === "CLOSE_ENOUGH" || value === "NOT_WORTH_IT" ? value : null;
  } catch {
    return null;
  }
}

function writePendingVote(comparisonId: string, value: VoteValue | null) {
  try {
    if (value) window.sessionStorage.setItem(PENDING_VOTE_KEY(comparisonId), value);
    else window.sessionStorage.removeItem(PENDING_VOTE_KEY(comparisonId));
  } catch {
    // Storage can be unavailable (private mode); the vote just isn't remembered.
  }
}

/**
 * Voting card for a comparison. Owns the live tally so a vote updates the
 * breakdown immediately, without waiting for the cached page to refresh.
 *
 * Signed-out visitors can still click a vote: we remember it, send them to
 * sign in, and submit it automatically when they come back.
 */
export function VotePanel({ comparisonId, slug, genericBrand, nameBrand, initialCounts }: VotePanelProps) {
  const { status } = useSession();
  const router = useRouter();
  const [counts, setCounts] = useState<VoteCounts>(initialCounts);
  const [currentVote, setCurrentVote] = useState<VoteValue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loadedForUser = useRef(false);

  const total = counts.sameQuality + counts.closeEnough + counts.notWorthIt;
  const votesNeeded = Math.max(0, MIN_VOTES_FOR_VERDICT - total);

  const submitVote = useCallback(
    async (value: VoteValue, previous: VoteValue | null) => {
      setCurrentVote(value);
      setError(null);
      setMessage(null);
      setIsLoading(true);
      try {
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comparisonId, value }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setCurrentVote(previous);
          setError(data.error ?? "We couldn't save your vote. Please try again.");
          return;
        }
        if (data.counts) setCounts(data.counts);
        setMessage(previous ? "Vote updated." : "Thanks — your vote counts toward the community verdict.");
      } catch {
        setCurrentVote(previous);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [comparisonId]
  );

  // Load the signed-in user's existing vote (the page itself is cached and
  // shared, so it can't contain per-user data), then replay any vote they
  // clicked before signing in.
  useEffect(() => {
    if (status !== "authenticated" || loadedForUser.current) return;
    loadedForUser.current = true;
    let cancelled = false;
    (async () => {
      let existing: VoteValue | null = null;
      try {
        const res = await fetch(`/api/votes?comparisonId=${encodeURIComponent(comparisonId)}`);
        if (res.ok) {
          const data = await res.json();
          existing = (data.vote?.value as VoteValue | undefined) ?? null;
        }
      } catch {
        // Non-fatal: the user can still vote.
      }
      if (cancelled) return;
      setCurrentVote(existing);
      const pending = readPendingVote(comparisonId);
      writePendingVote(comparisonId, null);
      if (pending && pending !== existing) {
        void submitVote(pending, existing);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, comparisonId, submitVote]);

  function handleVote(value: VoteValue) {
    if (isLoading) return;
    if (status !== "authenticated") {
      writePendingVote(comparisonId, value);
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/compare/${slug}`)}`);
      return;
    }
    void submitVote(value, currentVote);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Your verdict</p>
        <h2 className="mt-1.5 font-display text-[1.75rem] leading-[1.1] tracking-tight text-ink">Is {genericBrand} worth it?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Compared with {nameBrand}. One vote per person — you can change it any time.
        </p>
      </div>

      <VoteButtons currentVote={currentVote} onVote={handleVote} disabled={isLoading || status === "loading"} />

      {status === "unauthenticated" && (
        <p className="text-center text-sm text-muted">
          Pick an option and we&apos;ll ask you to{" "}
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(`/compare/${slug}`)}`}
            className="font-semibold text-brand-500 underline-offset-2 hover:underline"
          >
            sign in
          </Link>{" "}
          first.
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-bad-bg px-3 py-2 text-center text-sm font-medium text-bad" role="alert">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="rounded-xl bg-good-bg px-3 py-2 text-center text-sm font-medium text-good" role="status">
          {message}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface-2 p-4">
        <VoteBreakdown
          sameQuality={counts.sameQuality}
          closeEnough={counts.closeEnough}
          notWorthIt={counts.notWorthIt}
          totalVotes={total}
        />
        <p className="mt-4 border-t border-line pt-3 text-center text-xs text-muted">
          {total} community vote{total === 1 ? "" : "s"}
          {votesNeeded > 0
            ? ` · ${votesNeeded} more needed for a community verdict`
            : ""}
        </p>
      </div>
    </div>
  );
}
