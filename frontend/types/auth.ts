/** Oturum kullanıcı özeti (giriş / üye ol yanıtı) */
export interface AuthSessionUser {
  email: string | null;
  phone: string | null;
}

/** POST /auth/login ve /auth/register başarı gövdesi (MVP) */
export interface AuthSuccessResponse {
  access_token: string;
  token_type: string;
  user: AuthSessionUser;
}
