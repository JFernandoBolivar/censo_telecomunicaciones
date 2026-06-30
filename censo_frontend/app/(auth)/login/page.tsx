"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SplashScreen } from "@/shared/ui/components/splash-screen";
import { LoginForm } from "@/modules/auth/ui/login-form";
import { Broadcast, ChartLine, FileText } from "@phosphor-icons/react";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);

  if (!showLogin) {
    return <SplashScreen onEnter={() => setShowLogin(true)} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-[1100px] items-center gap-[60px]"
      >
        <motion.div
          className="hidden flex-1 md:block"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.15)] text-[36px] text-[#60a5fa] shadow-[0_8px_32px_rgba(30,107,255,0.15)]">
            <Broadcast size={36} weight="bold" />
          </div>
          <h2 className="mb-3 text-[32px] font-black tracking-tight text-[#f1f5f9]">
            CONATEL —{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] to-[#1e6bff] bg-clip-text text-transparent">
              Telecomunicaciones
            </span>
          </h2>
          <p className="max-w-[400px] text-base leading-relaxed text-[#94a3b8]">
            Plataforma institucional para la gestión de encuestas de infraestructura
            y vías generales de telecomunicaciones.
          </p>
          <div className="mt-7 flex flex-col gap-3.5">
            {[
              { icon: ChartLine, text: "Encuestas dinámicas por tipo de pregunta" },
              { icon: FileText, text: "Reportes y exportación de datos" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3.5 transition-all duration-300 hover:border-[rgba(30,107,255,0.2)] hover:bg-[rgba(30,107,255,0.08)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <item.icon className="size-[18px] text-[#60a5fa]" />
                <span className="text-sm font-medium text-[#94a3b8]">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <LoginForm />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
