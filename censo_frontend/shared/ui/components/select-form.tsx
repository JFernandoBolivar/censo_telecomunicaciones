"use client";

import { Controller } from "react-hook-form";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Label } from "@/shared/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select";
import type { ReactElement, ComponentType } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  title: string;
  placeholder?: string;
  options: Option[];
  subTitle?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export function SelectForm<T extends FieldValues>({
  form,
  name,
  title,
  placeholder = "Seleccione",
  options,
  subTitle,
  icon: Icon,
  disabled,
}: SelectFormProps<T>): ReactElement {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor={name} className="text-sm font-medium">{title}</Label>
          <div className="relative">
            {Icon && (
              <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Select
              disabled={disabled}
              value={String(field.value ?? "")}
              onValueChange={field.onChange}
            >
              <SelectTrigger id={name} className={Icon ? "pl-10" : ""}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
