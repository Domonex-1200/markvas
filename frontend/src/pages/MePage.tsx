import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { SiteHeader } from "../components/SiteHeader";
import { getMyProfile, updateMyProfile, applyForDeveloper, getMyDeveloperApplication } from "../lib/api";
import { ImageUploader } from "../components/ImageUploader";
import type { UserProfile, DeveloperApplication } from "../types";

export default function MePage(): JSX.Element {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("accessToken") ?? "";

  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");

  const [nickname, setNickname]             = useState("");
  const [phone, setPhone]                   = useState("");
  const [birthday, setBirthday]             = useState("");
  const [gender, setGender]                 = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [devApp, setDevApp]         = useState<DeveloperApplication | null>(null);
  const [applyReason, setApplyReason] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMsg, setApplyMsg]     = useState("");

  useEffect(() => {
    if (!token) { navigate("/login?next=/me"); return; }
    Promise.all([
      getMyProfile(token),
      getMyDeveloperApplication(token).catch(() => null),
    ])
      .then(([p, app]) => {
        setProfile(p);
        setNickname(p.nickname ?? "");
        setPhone(p.phone ?? "");
        setBirthday(p.birthday ?? "");
        setGender(p.gender ?? "");
        setProfilePictureUrl(p.profilePictureUrl ?? "");
        setDevApp(app);
      })
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  async function saveProfile(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateMyProfile(
        { nickname, phone, birthday, gender: gender || undefined, profilePictureUrl },
        token
      );
      setProfile(updated);
      setSaveMsg("저장되었습니다.");
    } catch {
      setSaveMsg("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function submitDeveloperApp(): Promise<void> {
    if (!applyReason.trim()) { setApplyMsg("신청 사유를 입력해 주세요."); return; }
    setApplyLoading(true);
    setApplyMsg("");
    try {
      const app = await applyForDeveloper(applyReason, token);
      setDevApp(app);
      setApplyMsg("신청이 접수되었습니다. 관리자 검토 후 승인됩니다.");
    } catch (caught) {
      if (axios.isAxiosError(caught)) {
        if (caught.response?.status === 409) { setApplyMsg("이미 신청 중이거나 개발자 계정입니다."); return; }
      }
      setApplyMsg("신청에 실패했습니다.");
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} />;
  if (!profile) return <ErrorScreen message="프로필을 불러오지 못했습니다." />;

  const roleLabel: Record<string, string> = { USER: "일반 사용자", DEVELOPER: "개발자", ADMIN: "관리자" };
  const roleColor: Record<string, string> = {
    USER:      "rgba(32,197,188,0.12)",
    DEVELOPER: "rgba(124,92,252,0.12)",
    ADMIN:     "rgba(239,68,68,0.12)",
  };
  const roleTextColor: Record<string, string> = {
    USER:      "var(--teal)",
    DEVELOPER: "var(--purple)",
    ADMIN:     "#f87171",
  };

  return (
    <main style={{ background: "var(--bg-base)" }}>
      <SiteHeader />

      <section className="hero-dark" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center gap-4">
            <div
              className="relative h-20 w-20 overflow-hidden rounded-full"
              style={{ background: "var(--bg-overlay)", border: "2px solid var(--border)" }}
            >
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt="프로필" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-black" style={{ color: "var(--text-secondary)" }}>
                  {((profile.nickname ?? profile.email) || "?")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{profile.nickname ?? profile.email}</h1>
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{profile.email}</p>
              <span
                className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: roleColor[profile.role] ?? "var(--bg-overlay)", color: roleTextColor[profile.role] ?? "var(--text-secondary)" }}
              >
                {roleLabel[profile.role] ?? profile.role}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">

        <Card title="프로필 편집">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="닉네임">
                <input className="field-input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="표시될 이름" />
              </Field>
              <Field label="전화번호">
                <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
              </Field>
              <Field label="생년월일">
                <input className="field-input" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </Field>
              <Field label="성별">
                <select className="field-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">선택 안 함</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                  <option value="OTHER">기타</option>
                </select>
              </Field>
            </div>
            <ImageUploader
              value={profilePictureUrl}
              onChange={setProfilePictureUrl}
              folder="uploads/profiles"
              label="프로필 사진"
              shape="circle"
              maxMb={5}
            />
            {saveMsg && (
              <p className="text-sm font-semibold" style={{ color: saveMsg.includes("실패") ? "#f87171" : "var(--teal)" }}>
                {saveMsg}
              </p>
            )}
            <button className="button" disabled={saving} type="submit">
              {saving ? "저장 중…" : "저장하기"}
            </button>
          </form>
        </Card>

        {profile.role === "USER" && (
          <Card title="개발자 신청">
            {devApp ? (
              <div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>신청 상태:
                  <span className="ml-2 font-bold" style={{
                    color: devApp.status === "PENDING" ? "#fbbf24"
                      : devApp.status === "APPROVED" ? "var(--teal)"
                      : "#f87171"
                  }}>
                    {devApp.status === "PENDING" ? "검토 중" : devApp.status === "APPROVED" ? "승인됨" : "거절됨"}
                  </span>
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>사유: {devApp.reason}</p>
                {devApp.reviewNote && (
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>관리자 메모: {devApp.reviewNote}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  개발자로 승인되면 에셋을 등록하고 스토어에 배포할 수 있습니다.
                </p>
                <Field label="신청 사유">
                  <textarea
                    className="field-input min-h-[100px] resize-y"
                    placeholder="개발자 신청 사유를 적어주세요 (예: 테마/플러그인 개발 계획)"
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                  />
                </Field>
                {applyMsg && (
                  <p className="text-sm font-semibold" style={{ color: applyMsg.includes("실패") ? "#f87171" : "var(--teal)" }}>
                    {applyMsg}
                  </p>
                )}
                <button className="button" disabled={applyLoading} onClick={submitDeveloperApp} type="button">
                  {applyLoading ? "신청 중…" : "개발자 신청"}
                </button>
              </div>
            )}
          </Card>
        )}

        {(profile.role === "DEVELOPER" || profile.role === "ADMIN") && (
          <Card title="내 에셋 관리">
            <p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>등록한 에셋을 관리하거나 새로운 에셋을 등록합니다.</p>
            <div className="flex gap-3">
              <Link className="button" to="/developer/assets">내 에셋 목록</Link>
              <Link className="button-secondary" to="/developer/assets/new">새 에셋 등록</Link>
            </div>
          </Card>
        )}

        {profile.role === "ADMIN" && (
          <Card title="관리자 패널">
            <p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>에셋 심사, 개발자 신청 관리, 사용자 관리를 합니다.</p>
            <Link className="button" to="/admin">관리자 대시보드</Link>
          </Card>
        )}

        <Card title="계정 정보">
          <dl className="space-y-2 text-sm">
            <InfoRow label="이메일" value={profile.email} />
            <InfoRow label="가입일" value={new Date(profile.createdAt).toLocaleDateString("ko-KR")} />
          </dl>
        </Card>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl p-6" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <h2 className="mb-4 text-lg font-black" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-24 shrink-0 font-bold" style={{ color: "var(--text-muted)" }}>{label}</dt>
      <dd style={{ color: "var(--text-secondary)" }}>{value}</dd>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main style={{ background: "var(--bg-base)" }}>
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>프로필 불러오는 중…</p>
      </div>
    </main>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main style={{ background: "var(--bg-base)" }}>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p style={{ color: "#f87171" }}>{message}</p>
        <Link className="button-secondary" to="/">홈으로</Link>
      </div>
    </main>
  );
}
