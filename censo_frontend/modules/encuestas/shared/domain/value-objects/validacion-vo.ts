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

  const rawDepends = data.dependsOn ?? data.depends_on;

  return {
    codigo: typeof data.codigo === "string" ? data.codigo : undefined,
    regex: typeof data.regex === "string" ? data.regex : undefined,
    minChars: typeof data.minChars === "number" ? data.minChars : undefined,
    maxChars: typeof data.maxChars === "number" ? data.maxChars : undefined,
    widget: typeof data.widget === "string" ? data.widget : null,
    dependsOn: rawDepends && typeof rawDepends === "object"
      ? {
          parentQuestionCode: String((rawDepends as Record<string, unknown>).parentQuestionCode ?? (rawDepends as Record<string, unknown>).parent_question_code),
          expectedValue: String((rawDepends as Record<string, unknown>).expectedValue ?? (rawDepends as Record<string, unknown>).expected_value),
          actionIfFalse: "hide",
        }
      : null,
  };
}
