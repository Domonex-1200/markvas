import { useEffect, useRef, useState } from "react";
import { CornerDownRight, Trash2, UserRound } from "lucide-react";
import { StarRating } from "./StarRating";
import { getAssetReviews, createReview, deleteReview } from "../lib/api";
import type { AssetReview } from "../types";

interface Props {
  assetId: string;
  assetAuthorId?: string;
}

function parseUserId(token: string): string {
  try { return (JSON.parse(atob(token.split(".")[1])) as { sub: string }).sub; } catch { return ""; }
}

export function ReviewSection({ assetId, assetAuthorId }: Props): JSX.Element {
  const token      = window.localStorage.getItem("accessToken") ?? "";
  const myUserId   = parseUserId(token);
  const isLoggedIn = !!token;

  const [reviews, setReviews]       = useState<AssetReview[]>([]);
  const [loading, setLoading]       = useState(true);
  const [myRating, setMyRating]     = useState(0);
  const [myBody, setMyBody]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState("");

  const alreadyReviewed = reviews.some((r) => !r.deleted && r.userId === myUserId && !r.parentId);
  const activeReviews   = reviews.filter((r) => !r.deleted || (r.replies ?? []).length > 0);
  const avg = reviews.filter(r => !r.deleted && !r.parentId && r.rating)
    .reduce((s, r, _, a) => s + (r.rating ?? 0) / a.length, 0);

  useEffect(() => {
    getAssetReviews(assetId)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [assetId]);

  async function submitReview(): Promise<void> {
    if (!token)       { setMsg("로그인이 필요합니다."); return; }
    if (myRating < 1) { setMsg("별점을 선택해주세요."); return; }
    setSubmitting(true); setMsg("");
    try {
      const r = await createReview(assetId, { rating: myRating, body: myBody.trim() || undefined }, token);
      setReviews((prev) => [{ ...r, replies: [] }, ...prev]);
      setMyRating(0); setMyBody("");
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      setMsg(err?.response?.status === 409 ? "이미 리뷰를 작성하셨습니다." : (err?.response?.data?.message ?? "작성에 실패했습니다."));
    } finally { setSubmitting(false); }
  }

  async function handleDelete(reviewId: string): Promise<void> {
    if (!token) return;
    try {
      await deleteReview(assetId, reviewId, token);
      setReviews((prev) => prev.map(r => {
        if (r.id === reviewId) return { ...r, deleted: true, body: undefined, userId: undefined, userNickname: undefined, userProfilePictureUrl: undefined };
        return { ...r, replies: (r.replies ?? []).map(rep => rep.id === reviewId ? { ...rep, deleted: true, body: undefined, userId: undefined, userNickname: undefined } : rep) };
      }));
    } catch { /* ignore */ }
  }

  const nonDeletedCount = reviews.filter(r => !r.deleted && !r.parentId).length;

  return (
    <div className="rounded-2xl p-7" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      {/* 헤더 */}
      <div className="mb-5 flex items-center gap-4">
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>리뷰</h2>
        {nonDeletedCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} size={15} />
            <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{avg.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>({nonDeletedCount})</span>
          </div>
        )}
      </div>

      {/* 작성 폼 */}
      {isLoggedIn && !alreadyReviewed && (
        <div className="mb-6 rounded-xl p-4" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
          <p className="mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>리뷰 작성</p>
          <div className="mb-3"><StarRating value={myRating} onChange={setMyRating} size={22} /></div>
          <textarea className="field-input min-h-[80px] resize-y" placeholder="이 에셋에 대한 의견을 남겨주세요 (선택)" value={myBody} onChange={e => setMyBody(e.target.value)} />
          {msg && <p className="mt-1 text-xs font-semibold" style={{ color: "#f87171" }}>{msg}</p>}
          <button className="button mt-2" disabled={submitting} onClick={() => void submitReview()} type="button">
            {submitting ? "등록 중…" : "리뷰 등록"}
          </button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>불러오는 중…</p>
      ) : activeReviews.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <ReviewItem
              key={r.id}
              review={r}
              myUserId={myUserId}
              assetAuthorId={assetAuthorId}
              isLoggedIn={isLoggedIn}
              assetId={assetId}
              token={token}
              onDelete={handleDelete}
              onReplyAdded={(reply) =>
                setReviews(prev => prev.map(rev =>
                  rev.id === r.id ? { ...rev, replies: [...(rev.replies ?? []), reply] } : rev
                ))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewItemProps {
  review: AssetReview;
  myUserId: string;
  assetAuthorId?: string;
  isLoggedIn: boolean;
  assetId: string;
  token: string;
  onDelete: (id: string) => void;
  onReplyAdded: (reply: AssetReview) => void;
  isReply?: boolean;
}

function ReviewItem({ review: r, myUserId, assetAuthorId, isLoggedIn, assetId, token, onDelete, onReplyAdded, isReply = false }: ReviewItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying]   = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  const canDelete = r.userId === myUserId || myUserId === assetAuthorId;

  async function submitReply(): Promise<void> {
    if (!replyBody.trim()) return;
    setReplying(true);
    try {
      const created = await createReview(assetId, { body: replyBody.trim(), parentId: r.id }, token);
      onReplyAdded(created);
      setReplyBody(""); setReplyOpen(false);
    } catch { /* ignore */ }
    finally { setReplying(false); }
  }

  return (
    <div className={isReply ? "ml-10 border-l-2 pl-4" : ""} style={isReply ? { borderColor: "var(--border)" } : {}}>
      <div className="flex gap-3">
        {/* 아바타 */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--bg-overlay)" }}>
          {!r.deleted && r.userProfilePictureUrl ? (
            <img src={r.userProfilePictureUrl} className="h-full w-full rounded-full object-cover" alt="" />
          ) : (
            <UserRound size={16} style={{ color: "var(--text-muted)" }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {r.deleted ? (
            /* 삭제된 리뷰 */
            <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>삭제된 리뷰입니다.</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.userNickname ?? "익명"}</span>
                  {!isReply && r.rating != null && r.rating > 0 && <StarRating value={r.rating} size={13} />}
                  {r.userId === assetAuthorId && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: "rgba(32,197,188,0.15)", color: "var(--teal)" }}>작성자</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                  {canDelete && (
                    <button onClick={() => void onDelete(r.id)} className="transition hover:opacity-70" style={{ color: "#f87171" }} title="삭제">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {r.body && <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{r.body}</p>}
              {!isReply && isLoggedIn && (
                <button
                  className="mt-1.5 flex items-center gap-1 text-xs font-semibold transition hover:opacity-80"
                  style={{ color: "var(--teal)" }}
                  onClick={() => { setReplyOpen(v => !v); setTimeout(() => textareaRef.current?.focus(), 50); }}
                >
                  <CornerDownRight size={12} />답글
                </button>
              )}
            </>
          )}

          {/* 답글 입력 */}
          {replyOpen && (
            <div className="mt-3 rounded-xl p-3" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
              <textarea
                ref={textareaRef}
                className="field-input min-h-[64px] resize-y text-sm"
                placeholder="답글을 입력하세요"
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button className="button text-xs" disabled={replying || !replyBody.trim()} onClick={() => void submitReply()} type="button">
                  {replying ? "등록 중…" : "등록"}
                </button>
                <button className="button-secondary text-xs" onClick={() => { setReplyOpen(false); setReplyBody(""); }} type="button">
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 대댓글 목록 */}
          {!isReply && (r.replies ?? []).length > 0 && (
            <div className="mt-3 space-y-3">
              {(r.replies ?? []).map(rep => (
                <ReviewItem
                  key={rep.id}
                  review={rep}
                  myUserId={myUserId}
                  assetAuthorId={assetAuthorId}
                  isLoggedIn={isLoggedIn}
                  assetId={assetId}
                  token={token}
                  onDelete={onDelete}
                  onReplyAdded={onReplyAdded}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
