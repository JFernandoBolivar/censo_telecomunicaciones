"use client";

import { Controller } from "react-hook-form";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Textarea } from "@/shared/ui/components/textarea";
import { Label } from "@/shared/ui/components/label";
import type { ReactElement, ComponentType } from "react";

interface TextareaFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  title: string;
  placeholder?: string;
  subTitle?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  rows?: number;
}

export function TextareaForm<T extends FieldValues>({
  form,
  name,
  title,
  placeholder,
  subTitle,
  icon: Icon,
  disabled,
  rows = 3,
}: TextareaFormProps<T>): ReactElement {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor={name} className="text-sm font-medium">{title}</Label>
          <div className="relative">
            {Icon && (
              <Icon className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            )}
            <Textarea
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
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
