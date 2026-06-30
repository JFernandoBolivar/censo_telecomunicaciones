import { auth } from "@/auth";
import SessionWrapper from "@/shared/ui/layout/session-wrapper";
import { AppSidebar } from "@/shared/ui/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/shared/ui/components/sidebar";
import { Separator } from "@/shared/ui/components/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/components/breadcrumb";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionWrapper session={session}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(17,24,39,0.85)] px-7 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-[20px]">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 rounded-xl bg-[rgba(30,107,255,0.1)] p-2.5 text-[#60a5fa] transition-all hover:bg-[rgba(30,107,255,0.2)]" />
              <Separator orientation="vertical" className="mx-2 h-6 bg-[rgba(255,255,255,0.06)]" />
              <div>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="text-[#94a3b8] hover:text-[#f1f5f9]">
                        CONATEL
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-[#64748b]" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[#f1f5f9]">Encuestas</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-4 py-3 transition-all duration-300 focus-within:border-[#1e6bff] focus-within:shadow-[0_0_0_4px_rgba(30,107,255,0.3)]">
              <svg className="size-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-[280px] border-none bg-transparent text-sm text-[#f1f5f9] outline-none placeholder:text-[#64748b]"
              />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SessionWrapper>
  );
}
