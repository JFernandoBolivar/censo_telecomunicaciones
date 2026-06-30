export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">CONATEL</h1>
          <p className="text-sm text-muted-foreground">
            Encuestas de Infraestructura y VGT
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
