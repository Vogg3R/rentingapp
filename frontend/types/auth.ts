/** Oturum kullanıcı özeti (giriş / üye ol yanıtı) */
export interface AuthSessionUser {
  id: string;
  email: string | null;
  phone: string | null;
}

/** POST /auth/login, /auth/register, /auth/refresh başarı gövdesi */
export interface AuthSuccessResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthSessionUser;
}
