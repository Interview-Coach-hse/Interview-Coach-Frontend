import type { ErrorResponse } from "@/api/generated/schema";

export type AppError = {
  title: string;
  message: string;
  status?: number;
  code?: string | null;
  fields?: Record<string, string>;
};

export class NetworkError extends Error {
  url: string;

  constructor(url: string, message?: string) {
    super(message ?? `Не удалось подключиться к backend по адресу ${url}`);
    this.name = "NetworkError";
    this.url = url;
  }
}

export class HttpError extends Error {
  status: number;
  payload?: ErrorResponse;

  constructor(status: number, payload?: ErrorResponse) {
    super(payload?.message ?? "Не удалось выполнить запрос");
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof HttpError) {
    if (error.payload?.code === "ASSESSMENT_SERVICE_UNAVAILABLE") {
      return {
        title: "Сервис оценки недоступен",
        message: error.payload.message ?? "Внешний assessment service временно недоступен. Повторите позже.",
        status: error.status,
        code: error.payload.code,
        fields: error.payload.errors,
      };
    }

    return {
      title: `Ошибка ${error.status}`,
      message: error.payload?.message ?? error.message,
      status: error.status,
      code: error.payload?.code,
      fields: error.payload?.errors,
    };
  }

  if (error instanceof NetworkError) {
    return {
      title: "Backend недоступен",
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Ошибка приложения",
      message: error.message,
    };
  }

  return {
    title: "Неизвестная ошибка",
    message: "Попробуйте обновить страницу или повторить действие позже.",
  };
}
