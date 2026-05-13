"""Kayıt / giriş için e-posta veya TR cep telefonu normalizasyonu (users tablosu ile uyumlu)."""


def normalize_contact(raw: str) -> tuple[str, dict]:
    """
    Tek iletişim anahtarı ve API yüzeyi için kullanıcı özeti.
    E-posta: küçük harf; telefon: son 10 hane (5 ile başlar).
    """
    s = raw.strip()
    if not s:
        raise ValueError("empty")
    if "@" in s:
        lower = s.lower()
        domain = lower.split("@")[-1]
        if "." not in domain or len(domain) < 2:
            raise ValueError("bad email")
        return f"email:{lower}", {"email": lower, "phone": None}
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) < 10:
        raise ValueError("bad phone")
    core = digits[-10:]
    if not core.startswith("5"):
        raise ValueError("bad phone")
    return f"phone:{core}", {"email": None, "phone": core}
