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
  const alreadyReviewed = reviews.some((r) => r.userId === myUserId);

  useEffect(() => {
    getAssetReviews(assetId)
      .then(setReviews)
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
    <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center gap-4">
        <h2 className="text-base font-bold text-slate-900">리뷰</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} size={15} />
            <span className="text-sm font-bold text-slate-700">{avg.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* 작성 폼 */}
      {token && !alreadyReviewed && (
        <div className="mb-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">리뷰 작성</p>
          <div className="mb-3">
            <StarRating value={myRating} onChange={setMyRating} size={22} />
          </div>
          <textarea
            className="field-input min-h-[80px] resize-y"
            placeholder="이 에셋에 대한 의견을 남겨주세요 (선택)"
            value={myBody}
            onChange={(e) => setMyBody(e.target.value)}
          />
          {msg && <p className="mt-1 text-xs font-semibold text-red-500">{msg}</p>}
          <button className="button mt-2" disabled={submitting} onClick={submit} type="button">
            {submitting ? "등록 중…" : "리뷰 등록"}
          </button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {loading ? (
        <p className="text-sm text-slate-400">불러오는 중…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-400">아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                {r.userProfilePictureUrl ? (
                  <img src={r.userProfilePictureUrl} className="h-full w-full rounded-full object-cover" alt="" />
                ) : (
                  <UserRound size={16} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{r.userNickname ?? "익명"}</span>
                    <StarRating value={r.rating} size={13} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                    {r.userId === myUserId && (
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => void remove(r)}
                        type="button"
                      >삭제</button>
                    )}
                  </div>
                </div>
                {r.body && <p className="mt-1 text-sm leading-6 text-slate-600">{r.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
