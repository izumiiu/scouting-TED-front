export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Requested-With", "TedIntake");
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (response.status === 204) return undefined as T;
  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("ติดต่อระบบไม่ได้ กรุณาตรวจ backend", response.status);
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("ted:session-expired"));
    throw new ApiError(
      body.error?.message ?? "ทำรายการไม่สำเร็จ",
      response.status,
    );
  }
  return body as T;
}
export const mutation = (
  method: string,
  body: unknown,
  key?: string,
): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: key ? { "Idempotency-Key": key } : {},
});
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "ทำรายการไม่สำเร็จ";
