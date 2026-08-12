export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toAbsoluteUrl(path: string | null | undefined): string | undefined {
  return path ?? undefined;
}
