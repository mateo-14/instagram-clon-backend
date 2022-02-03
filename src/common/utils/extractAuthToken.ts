export default function extractAuthToken(authHeader: string) : string | null {
  const token = authHeader?.split(' ');
  if (!token || token.length < 2) return null;
  return token[1];
}