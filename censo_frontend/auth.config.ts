import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/modules/auth/ui/schema/schema-login";
import { cookies } from "next/headers";

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    nombre_empresa: string;
    rif_empresa: string;
    is_active: boolean;
    is_staff: boolean;
  };
}

export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("Credenciales inválidas.");

        try {
          const response = await fetch(
            `${process.env.DJANGO_API_SERVER}auth/login/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: parsed.data.email,
                password: parsed.data.password,
              }),
            },
          );

          if (!response.ok) throw new Error("Credenciales inválidas.");

          const body: { status: string; data: LoginResponse } = await response.json();
          const data = body.data;

          const cookieStore = await cookies();
          cookieStore.set("dj_access", data.access, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 8 * 60 * 60,
            path: "/",
          });
          cookieStore.set("dj_refresh", data.refresh, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
            path: "/",
          });

          return {
            id: String(data.user.id),
            name: data.user.nombre_empresa,
            email: data.user.email,
            nombreEmpresa: data.user.nombre_empresa,
            rifEmpresa: data.user.rif_empresa,
            isActive: data.user.is_active,
            isStaff: data.user.is_staff,
            djAccess: data.access,
            djRefresh: data.refresh,
          };
        } catch {
          throw new Error("Error de autenticación");
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
