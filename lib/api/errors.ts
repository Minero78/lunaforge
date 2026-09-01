export function jsonError(message: string, status: number, code: string) {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
