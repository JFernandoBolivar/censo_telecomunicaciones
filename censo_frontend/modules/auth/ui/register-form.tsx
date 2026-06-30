"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InputForm } from "@/shared/ui/components/input-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/components/card";
import { Envelope, BuildingOffice, IdentificationBadge, Key, UserPlus, Spinner } from "@phosphor-icons/react";
import { registerAction } from "../infrastructure/actions/auth-actions";
import { registerFormSchema, type RegisterFormType } from "./schema/schema-register";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: "", nombreEmpresa: "", rifEmpresa: "", password: "", confirmarPassword: "" },
  });

  const onSubmit = (data: RegisterFormType) => {
    startTransition(async () => {
      const result = await registerAction({
        email: data.email,
        nombreEmpresa: data.nombreEmpresa,
        rifEmpresa: data.rifEmpresa,
        password: data.password,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Registro exitoso");
      router.push("/encuestas");
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center pb-4 text-center">
        <CardTitle>Registrar Empresa</CardTitle>
        <CardDescription>Complete los datos para registrarse</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <InputForm<RegisterFormType>
            form={form}
            name="nombreEmpresa"
            title="Nombre de la empresa"
            type="text"
            placeholder="Empresa Telecom S.A."
            icon={BuildingOffice}
          />
          <InputForm<RegisterFormType>
            form={form}
            name="rifEmpresa"
            title="RIF"
            type="text"
            placeholder="J-12345678-9"
            icon={IdentificationBadge}
          />
          <InputForm<RegisterFormType>
            form={form}
            name="email"
            title="Correo electrónico"
            type="email"
            placeholder="correo@empresa.com"
            icon={Envelope}
          />
          <InputForm<RegisterFormType>
            form={form}
            name="password"
            title="Contraseña"
            type="password"
            placeholder="••••••••"
            icon={Key}
          />
          <InputForm<RegisterFormType>
            form={form}
            name="confirmarPassword"
            title="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            icon={Key}
          />
          <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {isPending ? "Registrando..." : "Registrar Empresa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
