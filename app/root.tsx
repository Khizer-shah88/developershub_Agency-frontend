export default function RootFallbackPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-xl space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Developer Hub</h1>
        <p className="text-base text-muted-foreground">
          The site is deployed successfully. If you are seeing a 404 from the production URL,
          Vercel is likely serving the wrong deployment or domain alias.
        </p>
      </div>
    </main>
  );
}