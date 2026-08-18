import { NextRequest, NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiResponse> {
  return error(message, 401);
}

export function forbidden(message = "Forbidden"): NextResponse<ApiResponse> {
  return error(message, 403);
}

export function notFound(message = "Not found"): NextResponse<ApiResponse> {
  return error(message, 404);
}

export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
