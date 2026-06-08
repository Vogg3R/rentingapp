/** Seçilen görsel dosyasını data URL (Base64) formatına çevirir */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Dosya okunamadı."));
    };
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
}

/** E-posta adresinden @ öncesi görünen adı üretir */
export function fallbackNameFromEmail(email: string | null | undefined): string | null {
  if (!email?.includes("@")) return null;
  const local = email.split("@")[0]?.trim();
  return local || null;
}
