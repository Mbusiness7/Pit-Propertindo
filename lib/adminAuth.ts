// lib/adminAuth.ts
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// called by /admin/login when user submits form
export function checkAdminCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in env");
    return false;
  }

  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// used by page.tsx and API routes to check cookie
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies(); // Next 16: cookies() is async
  const token = cookieStore.get("pit_admin");
  return token?.value === "ok";
}

