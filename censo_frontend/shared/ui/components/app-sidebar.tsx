"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/shared/ui/components/sidebar";
import { ClipboardText, Gear, Users, SignOut, Broadcast } from "@phosphor-icons/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Encuestas", url: "/encuestas", icon: ClipboardText },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar className="!border-r !border-[rgba(255,255,255,0.06)] !bg-[rgba(10,14,26,0.95)] backdrop-blur-[20px]">
      <SidebarHeader className="border-b border-[rgba(255,255,255,0.06)] px-5 py-6">
        <Link href="/" className="flex items-center gap-3.5">
          <div className="relative flex size-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#1e6bff] to-[#60a5fa] text-[22px] text-white shadow-[0_8px_24px_rgba(30,107,255,0.25)]">
            <Broadcast size={22} weight="bold" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#f1f5f9]">
            CONATEL
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      className={`relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 hover:translate-x-1 ${
                        active
                          ? "bg-[rgba(30,107,255,0.08)] text-[#f1f5f9]"
                          : "text-[#94a3b8] hover:bg-[rgba(30,107,255,0.08)] hover:text-[#f1f5f9]"
                      }`}
                    >
                      <item.icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {session?.user.isStaff && (
          <SidebarGroup className="mt-2">
            <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
              Administración
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin/respuestas" />}
                    isActive={isActive("/admin/respuestas")}
                    className={`relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      isActive("/admin/respuestas")
                        ? "bg-[rgba(30,107,255,0.08)] text-[#f1f5f9]"
                        : "text-[#94a3b8] hover:bg-[rgba(30,107,255,0.08)] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <Gear className="size-5" />
                    <span>Respuestas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin/usuarios" />}
                    isActive={isActive("/admin/usuarios")}
                    className={`relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      isActive("/admin/usuarios")
                        ? "bg-[rgba(30,107,255,0.08)] text-[#f1f5f9]"
                        : "text-[#94a3b8] hover:bg-[rgba(30,107,255,0.08)] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <Users className="size-5" />
                    <span>Usuarios</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-[rgba(255,255,255,0.06)] p-4">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[rgba(255,255,255,0.02)] p-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e6bff] to-[#60a5fa] text-sm font-bold text-white">
            {session?.user?.nombreEmpresa?.charAt(0) || "E"}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-semibold text-[#f1f5f9]">
              {session?.user?.nombreEmpresa}
            </p>
            <p className="truncate text-xs text-[#64748b]">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm font-semibold text-[#fca5a5] transition-all duration-300 hover:bg-[rgba(239,68,68,0.15)]"
        >
          <SignOut className="size-5" />
          <span>Cerrar Sesión</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
