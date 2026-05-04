import Link from "next/link";
import Image from "next/image";

export function EldenEleLogoLink({
  className = "",
  variant = "header",
}: {
  className?: string;
  /** İleride alt yerleşimler için ayrılmış; şu an yalnızca header */
  variant?: string;
}) {
  void variant;
  return (
    <Link
      href="/"
      className={`flex items-center gap-1.5 ${className}`}
      aria-label="EldenEle ana sayfa"
    >
      <Image
        src="/elden-ele-handshake-symbol.svg"
        alt=""
        width={34}
        height={34}
        className="shrink-0"
        priority
      />
      <span className="text-2xl tracking-tight">
        <span className="font-bold text-[#2563EB]">Elden</span>
        <span className="font-normal text-slate-800 dark:text-slate-200">
          Ele
        </span>
      </span>
    </Link>
  );
}
