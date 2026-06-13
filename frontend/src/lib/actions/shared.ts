import { ApiError } from "@/lib/api";

export interface ActionState {
  error: string | null;
  success?: boolean;
}

export const INITIAL_ACTION_STATE: ActionState = { error: null };

const UNEXPECTED_ERROR_MESSAGE = "Error inesperado, intentá de nuevo";

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return UNEXPECTED_ERROR_MESSAGE;
}
