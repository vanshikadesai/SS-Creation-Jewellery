import { NextResponse } from "next/server";

export function apiError(err: unknown) {
  const status = (err as { status?: number })?.status ?? 500;
  // Routes throw real Error subclasses (UnauthorizedError, ForbiddenError)
  // as well as plain { status, message } objects for validation failures
  // (e.g. apiError({ status: 400, message: "..." })) — both need their
  // message surfaced to the client, not just Error instances.
  const message =
    err instanceof Error
      ? err.message
      : typeof (err as { message?: unknown })?.message === "string"
      ? (err as { message: string }).message
      : "Something went wrong. Please try again.";
  if (status === 500) {
    // Log full detail server-side; never leak internals to the client.
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
  return NextResponse.json({ error: message }, { status });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
