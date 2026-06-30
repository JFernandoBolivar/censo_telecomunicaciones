import { BgAnimated } from "@/shared/ui/components/bg-animated";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BgAnimated />
      <section className="relative z-[1] flex min-h-screen items-center justify-center overflow-hidden p-10">
        {children}
      </section>
    </>
  );
}
