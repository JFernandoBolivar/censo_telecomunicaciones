"use server";

import { signIn } from "@/auth";
import { repoAuthApi } from "../repositories/repo-auth-api";
import { registrarUsuario } from "../../application/use-cases/registrar-usuario";
import type { RegisterDTO } from "../../application/dtos/login-dto";

export async function loginAction(formData: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    return { success: "Inicio de sesión correcto" };
  } catch {
    return { error: "Credenciales inválidas" };
  }
}

export async function registerAction(data: RegisterDTO) {
  try {
    await registrarUsuario(repoAuthApi, data);
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return { success: "Registro exitoso" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al registrar" };
  }
}
