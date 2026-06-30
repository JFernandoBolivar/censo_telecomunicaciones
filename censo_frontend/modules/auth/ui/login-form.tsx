"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InputForm } from "@/shared/ui/components/input-form";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/components/card";
import { Envelope, Key, SignIn, Spinner } from "@phosphor-icons/react";
import { loginAction } from "../infrastructure/actions/auth-actions";
import { signInSchema, type LoginFormType } from "./schema/schema-login";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginFormType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormType) => {
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Bienvenido al sistema");
      router.push("/encuestas");
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center pb-4 text-center">
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingrese sus credenciales</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <InputForm<LoginFormType>
            form={form}
            name="email"
            title="Correo electrónico"
            type="email"
            placeholder="correo@empresa.com"
            icon={Envelope}
          />
          <InputForm<LoginFormType>
            form={form}
            name="password"
            title="Contraseña"
            type="password"
            placeholder="••••••••"
            icon={Key}
          />
          <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
            {isPending ? <Spinner className="size-4 animate-spin" /> : <SignIn className="size-4" />}
            {isPending ? "Ingresando..." : "Ingresar al Sistema"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
