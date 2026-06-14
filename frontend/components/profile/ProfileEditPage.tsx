"use client";

import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { fallbackNameFromEmail, fileToDataUrl } from "@/lib/profile-images";
import { isLoggedIn } from "@/lib/session";
import { fetchMyProfile, updateProfile } from "@/services/profile";
import type { ProfileSummary } from "@/types/profile";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ProfileEditPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    fetchMyProfile().then((res) => {
      if (!res.ok) {
        setLoadError(res.message);
        return;
      }
      const p = res.data;
      setProfile(p);
      setName(p.name ?? "");
      setLocation(p.location ?? "");
      setBio(p.bio ?? "");
      setInstagram(p.instagram ?? "");
      setLinkedin(p.linkedin ?? "");
      setAvatarPreview(p.avatar_base64);
      setCoverPreview(p.cover_base64);
    });
  }, [router]);

  useEffect(() => {
    return () => {
      if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
      if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    };
  }, [avatarBlobUrl, coverBlobUrl]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const displayName = useMemo(() => {
    if (name.trim()) return name.trim();
    return (
      fallbackNameFromEmail(profile?.email) ?? profile?.phone ?? "Kullanıcı"
    );
  }, [name, profile]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
    const url = URL.createObjectURL(file);
    setAvatarBlobUrl(url);
    setAvatarPreview(url);
    setPendingAvatarFile(file);
    e.target.value = "";
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    const url = URL.createObjectURL(file);
    setCoverBlobUrl(url);
    setCoverPreview(url);
    setPendingCoverFile(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);

    const payload: Parameters<typeof updateProfile>[0] = {
      name: name.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
      instagram: instagram.trim() || null,
      linkedin: linkedin.trim() || null,
    };

    try {
      if (pendingAvatarFile) {
        payload.avatar_base64 = await fileToDataUrl(pendingAvatarFile);
      }
      if (pendingCoverFile) {
        payload.cover_base64 = await fileToDataUrl(pendingCoverFile);
      }
    } catch {
      setSaving(false);
      setSubmitError("Fotoğraf dosyası okunamadı.");
      return;
    }

    const res = await updateProfile(payload);

    setSaving(false);

    if (!res.ok) {
      setSubmitError(res.message);
      return;
    }

    setToast("Profil başarıyla güncellendi");
    window.setTimeout(() => router.push("/profil"), 600);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/30 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <InteractivePageShell className="bg-[var(--color-app-bg)] text-[var(--color-text)]">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Profile geri dön"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Profili Düzenle</h1>
          </div>
          <button
            type="submit"
            form="profile-edit-form"
            disabled={saving || !profile}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {loadError ? (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-300">{loadError}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="min-w-0 space-y-5 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] dark:border-slate-700">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="group relative block h-56 w-full border-b border-slate-200 text-left dark:border-slate-700"
              >
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt="Kapak önizlemesi"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-900" />
                )}
                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-100">
                  <Camera className="size-7" />
                  <span className="text-sm font-medium">Kapak fotoğrafını yükle</span>
                </div>
              </button>

              <div className="relative border-t border-slate-200 p-4 pt-14 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="group absolute -top-10 left-4"
                  aria-label="Profil fotoğrafını değiştir"
                >
                  <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-lg font-bold text-slate-700 shadow-xl dark:border-slate-800 dark:bg-slate-700 dark:text-slate-100">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt="Avatar önizlemesi"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initialsFromName(displayName)
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                      <Camera className="size-5 opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </div>
                </button>
                <p className="text-2xl font-bold text-[var(--color-text)]">{displayName}</p>
                {location ? (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{location}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-4 dark:border-slate-700">
              <h2 className="text-lg font-bold">Onay Durumu</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Smartphone className="size-3.5" />
                  Telefon Onaylı
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  E-Posta Onaylı
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  Kimlik Doğrulanmış
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Rozetler, doğrulama işlemi tamamlandığında otomatik güncellenir.
              </p>
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 lg:col-span-7 dark:border-slate-700">
            <form id="profile-edit-form" className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Adı Soyadı"
                  value={name}
                  onChange={setName}
                  placeholder="Ahmet Yılmaz"
                  disabled={!profile}
                />
                <Field
                  label="Konum"
                  value={location}
                  onChange={setLocation}
                  placeholder="Lefkoşa, Kıbrıs"
                  disabled={!profile}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Hakkımda
                </label>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!profile}
                  placeholder="Kendinizi ve kiralama alışkanlıklarınızı kısaca anlatın."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Instagram"
                  value={instagram}
                  onChange={setInstagram}
                  placeholder="@kullaniciadi"
                  disabled={!profile}
                />
                <Field
                  label="LinkedIn"
                  value={linkedin}
                  onChange={setLinkedin}
                  placeholder="https://linkedin.com/in/kullaniciadi"
                  disabled={!profile}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="E-Posta"
                  value={profile?.email ?? ""}
                  onChange={() => {}}
                  placeholder="—"
                  disabled
                />
                <Field
                  label="Telefon"
                  value={profile?.phone ?? ""}
                  onChange={() => {}}
                  placeholder="—"
                  disabled
                />
              </div>

              {submitError ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving || !profile}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
                <Link
                  href="/profil"
                  className="rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Vazgeç
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>

      {toast ? (
        <div
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg dark:border-emerald-700/50 dark:bg-slate-900 dark:text-emerald-300 md:bottom-8"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" aria-hidden />
          {toast}
        </div>
      ) : null}
    </InteractivePageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/30 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}
