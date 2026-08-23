export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      service: "axon-web",
      status: "ready",
      version: process.env.APP_VERSION ?? "0.1.0",
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
