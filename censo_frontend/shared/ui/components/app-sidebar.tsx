"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/shared/ui/components/sidebar";
import { ClipboardText, MapPin, Gear, Users, SignOut } from "@phosphor-icons/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const items = [
  { title: "Encuestas", url: "/encuestas", icon: ClipboardText },
];

export function AppSidebar() {
  const { data: session } = useSession();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          CONATEL
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {session?.user.isStaff && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/respuestas" />}>
                    <Gear className="size-4" />
                    <span>Todas las Respuestas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/admin/usuarios" />}>
                    <Users className="size-4" />
                    <span>Usuarios</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 truncate">
            <p className="truncate font-medium">{session?.user?.nombreEmpresa}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <SignOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
