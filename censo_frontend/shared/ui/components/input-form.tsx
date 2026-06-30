"use client";

import { Controller } from "react-hook-form";
import type { FieldValues, Path, UseFormReturn, FieldError } from "react-hook-form";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import type { ReactElement, ComponentType } from "react";

interface InputFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  title: string;
  type?: string;
  placeholder?: string;
  subTitle?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

function getNestedError(errors: unknown, path: string): FieldError | undefined {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors) as FieldError | undefined;
}

export function InputForm<T extends FieldValues>({
  form,
  name,
  title,
  type = "text",
  placeholder,
  subTitle,
  icon: Icon,
  disabled,
}: InputFormProps<T>): ReactElement {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor={name} className="text-sm font-medium">{title}</Label>
          <div className="relative">
            {Icon && (
              <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={Icon ? "pl-10" : ""}
              {...field}
            />
          </div>
          {subTitle && (
            <p className="text-xs text-muted-foreground">{subTitle}</p>
          )}
          {fieldState.error?.message && (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
