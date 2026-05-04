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
      className={`inline-flex items-center gap-[0.4em] text-2xl leading-none tracking-tight ${className}`}
      aria-label="EldenEle ana sayfa"
    >
      <Image
        src="/elden-ele-handshake-symbol.svg"
        alt=""
        width={96}
        height={96}
        className="h-[1.18em] w-[1.18em] shrink-0 translate-y-[0.03em]"
        priority
      />
      <span>
        <span className="font-bold text-[#2563EB]">Elden</span>
        <span className="font-normal text-slate-800 dark:text-slate-200">
          Ele
        </span>
      </span>
    </Link>
  );
}
