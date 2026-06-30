"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InputForm } from "@/shared/ui/components/input-form";
import { Button } from "@/shared/ui/components/button";
import { Envelope, Key, SignIn, Spinner, Broadcast, ShieldCheck } from "@phosphor-icons/react";
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
    <div className="glass-card w-full !max-w-[440px] p-[50px]">
      <div className="mb-7 flex justify-center gap-5">
        <div className="flex size-[76px] animate-[logoPulse_3s_ease-in-out_infinite] items-center justify-center rounded-[22px] border border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.15)] text-[30px] text-[#60a5fa] shadow-[0_8px_32px_rgba(30,107,255,0.15)]">
          <Broadcast size={30} weight="bold" />
        </div>
        <div className="flex size-[76px] animate-[logoPulse_3s_ease-in-out_infinite] items-center justify-center rounded-[22px] border border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.15)] text-[30px] text-[#60a5fa] shadow-[0_8px_32px_rgba(30,107,255,0.15)]" style={{ animationDelay: "0.5s" }}>
          <ShieldCheck size={30} weight="bold" />
        </div>
      </div>

      <h1 className="mb-2 text-center text-[26px] font-extrabold tracking-tight text-[#f1f5f9]">
        Acceso al Sistema
      </h1>
      <p className="mb-8 text-center text-sm text-[#94a3b8]">
        Ingrese sus credenciales institucionales
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        <Button
          type="submit"
          disabled={isPending}
          className="!mt-4 !h-[58px] w-full !rounded-[18px] !bg-gradient-to-br !from-[#0b3c91] !to-[#1e6bff] !text-base !font-bold !text-white !shadow-[0_12px_30px_rgba(30,107,255,0.3)] transition-all duration-300 hover:-translate-y-[3px] hover:!shadow-[0_18px_40px_rgba(30,107,255,0.4)] active:scale-[0.98]"
        >
          {isPending ? (
            <Spinner className="size-4 animate-spin" />
          ) : (
            <SignIn className="size-4" />
          )}
          {isPending ? "Ingresando..." : "Ingresar al Sistema"}
        </Button>
      </form>
    </div>
  );
}
