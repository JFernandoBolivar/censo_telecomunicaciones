export interface DependsOn {
  readonly parentQuestionCode: string;
  readonly expectedValue: string;
  readonly actionIfFalse: "hide";
}

export interface ValidacionVO {
  readonly codigo?: string;
  readonly regex?: string;
  readonly minChars?: number;
  readonly maxChars?: number;
  readonly widget?: string | null;
  readonly dependsOn?: DependsOn | null;
}

export function createValidacionVO(data: Record<string, unknown> | null): ValidacionVO | null {
  if (!data) return null;

  return {
    codigo: typeof data.codigo === "string" ? data.codigo : undefined,
    regex: typeof data.regex === "string" ? data.regex : undefined,
    minChars: typeof data.minChars === "number" ? data.minChars : undefined,
    maxChars: typeof data.maxChars === "number" ? data.maxChars : undefined,
    widget: typeof data.widget === "string" ? data.widget : null,
    dependsOn: data.dependsOn && typeof data.dependsOn === "object"
      ? {
          parentQuestionCode: String((data.dependsOn as Record<string, unknown>).parentQuestionCode),
          expectedValue: String((data.dependsOn as Record<string, unknown>).expectedValue),
          actionIfFalse: "hide",
        }
      : null,
  };
}
