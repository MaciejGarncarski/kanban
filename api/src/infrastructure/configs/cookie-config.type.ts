export interface CookieConfig {
  secret: string;
  name: string;
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  domain: string;
}
