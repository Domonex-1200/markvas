import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { StarRating } from "./StarRating";
import { getAssetReviews, createReview, deleteReview } from "../lib/api";
import type { AssetReview } from "../types";

interface Props {
  assetId: string;
}

export function ReviewSection({ assetId }: Props): JSX.Element {
  const token = window.localStorage.getItem("accessToken") ?? "";
  const myUserId = (() => {
    try { return JSON.parse(atob(token.split(".")[1])).sub as string; } catch { return ""; }
  })();

  const [reviews, setReviews] = useState<AssetReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const alreadyReviewed = Array.isArray(reviews) && reviews.some((r) => r.userId === myUserId);

  useEffect(() => {
    getAssetReviews(assetId)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [assetId]);

  async function submit(): Promise<void> {
    if (!token) { setMsg("로그인이 필요합니다."); return; }
    if (myRating === 0) { setMsg("별점을 선택해주세요."); return; }
    setSubmitting(true);
    setMsg("");
    try {
      const r = await createReview(assetId, { rating: myRating, body: myBody.trim() || undefined }, token);
      setReviews((prev) => [r, ...prev]);
      setMyRating(0);
      setMyBody("");
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      setMsg(err?.response?.status === 409 ? "이미 리뷰를 작성하셨습니다." : "작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(review: AssetReview): Promise<void> {
    if (!token) return;
    try {
      await deleteReview(assetId, review.id, token);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch { /* ignore */ }
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="rounded-2xl p-7" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <div className="mb-5 flex items-center gap-4">
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>리뷰</h2>
        {Array.isArray(reviews) && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} size={15} />
            <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{avg.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>({reviews.length})</span>
          </div>
        )}
      </div>

      {/* 작성 폼 */}
      {token && !alreadyReviewed && (
        <div className="mb-6 rounded-xl p-4" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
          <p className="mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>리뷰 작성</p>
          <div className="mb-3">
            <StarRating value={myRating} onChange={setMyRating} size={22} />
          </div>
          <textarea
            className="field-input min-h-[80px] resize-y"
            placeholder="이 에셋에 대한 의견을 남겨주세요 (선택)"
            value={myBody}
            onChange={(e) => setMyBody(e.target.value)}
          />
          {msg && <p className="mt-1 text-xs font-semibold" style={{ color: "#f87171" }}>{msg}</p>}
          <button className="button mt-2" disabled={submitting} onClick={submit} type="button">
            {submitting ? "등록 중…" : "리뷰 등록"}
          </button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>불러오는 중…</p>
      ) : !Array.isArray(reviews) || reviews.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--bg-overlay)" }}>
                {r.userProfilePictureUrl ? (
                  <img src={r.userProfilePictureUrl} className="h-full w-full rounded-full object-cover" alt="" />
                ) : (
                  <UserRound size={16} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.userNickname ?? "익명"}</span>
                    <StarRating value={r.rating} size={13} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                    {r.userId === myUserId && (
                      <button
                        className="text-xs transition hover:opacity-80"
                        style={{ color: "#f87171" }}
                        onClick={() => void remove(r)}
                        type="button"
                      >삭제</button>
                    )}
                  </div>
                </div>
                {r.body && <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{r.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
