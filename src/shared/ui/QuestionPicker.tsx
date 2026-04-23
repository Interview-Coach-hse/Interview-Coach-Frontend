import { useEffect, useMemo, useState } from "react";
import { QuestionStatus, type QuestionResponse } from "@/api/generated/schema";
import type { AdminQuestionsFilters, PageQuestionResponse } from "@/features/admin/api/admin.api";
import { adminApi } from "@/features/admin/api/admin.api";
import { cn } from "@/shared/lib/cn";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Loader } from "@/shared/ui/Loader";

type QuestionPickerProps = {
  value?: string;
  onChange: (questionId: string) => void;
  excludeProfileId?: string;
  disabled?: boolean;
  error?: string;
  initialData?: PageQuestionResponse;
};

const DEFAULT_FILTERS: Pick<AdminQuestionsFilters, "page" | "size" | "sortBy" | "sortDir" | "status"> = {
  page: 0,
  size: 20,
  sortBy: "updatedAt",
  sortDir: "desc",
  status: QuestionStatus.Active,
};

function formatQuestionMeta(question: QuestionResponse) {
  return [question.direction, question.difficulty, question.questionType].filter(Boolean).join(" • ");
}

export function QuestionPicker({
  value,
  onChange,
  excludeProfileId,
  disabled,
  error,
  initialData,
}: QuestionPickerProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<QuestionResponse[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    setOptions(initialData?.items ?? []);
    setPage(initialData?.page ?? 0);
    setTotalPages(initialData?.totalPages ?? 0);

    if (value) {
      setSelectedQuestion((initialData?.items ?? []).find((question) => question.id === value) ?? null);
    }
  }, [initialData]);

  useEffect(() => {
    let isCancelled = false;

    const filters: AdminQuestionsFilters = {
      ...DEFAULT_FILTERS,
      excludeProfileId,
      query: debouncedQuery.trim() || undefined,
    };

    setIsLoading(true);
    setIsError(false);

    void adminApi
      .questions(filters)
      .then((response) => {
        if (isCancelled) {
          return;
        }

        setOptions(response.items ?? []);
        setPage(response.page ?? 0);
        setTotalPages(response.totalPages ?? 0);
        setSelectedQuestion((currentValue) => {
          if (currentValue?.id === value) {
            return response.items?.find((question) => question.id === value) ?? currentValue;
          }

          return response.items?.find((question) => question.id === value) ?? currentValue;
        });
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setOptions([]);
        setPage(0);
        setTotalPages(0);
        setIsError(true);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, excludeProfileId]);

  useEffect(() => {
    if (!value) {
      setSelectedQuestion(null);
      return;
    }

    const matchedQuestion = options.find((question) => question.id === value);

    if (matchedQuestion) {
      setSelectedQuestion(matchedQuestion);
    }
  }, [options, value]);

  const helperText = useMemo(() => {
    if (debouncedQuery.trim()) {
      return `Найдено результатов: ${options.length}`;
    }

    return `Показаны свежие вопросы${totalPages > 1 ? `, страница ${page + 1}` : ""}`;
  }, [debouncedQuery, options.length, page, totalPages]);

  return (
    <div className="field">
      <span className="field-label">Вопрос</span>
      <div className={cn("question-picker", error && "question-picker-error", disabled && "question-picker-disabled")}>
        <Input
          label="Поиск"
          placeholder="Начните вводить текст вопроса"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setHasInteracted(true);
            setQuery(event.target.value);
          }}
        />
        {selectedQuestion ? (
          <div className="question-picker-selection">
            <div>
              <strong>{selectedQuestion.text ?? "Без текста"}</strong>
              <p className="muted">{formatQuestionMeta(selectedQuestion) || "Без метаданных"}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                setSelectedQuestion(null);
                onChange("");
              }}
            >
              Очистить
            </Button>
          </div>
        ) : null}
        <div className="question-picker-status">
          {isLoading ? <Loader /> : null}
          <span className="muted">{helperText}</span>
        </div>
        <div className="question-picker-results" role="listbox" aria-label="Результаты поиска вопросов">
          {options.map((question) => {
            const isSelected = question.id === value;

            return (
              <button
                key={question.id}
                type="button"
                className={cn("question-picker-option", isSelected && "question-picker-option-active")}
                disabled={disabled || !question.id}
                onClick={() => {
                  if (!question.id) {
                    return;
                  }

                  setSelectedQuestion(question);
                  onChange(question.id);
                }}
              >
                <div className="question-picker-option-copy">
                  <strong>{question.text ?? "Без текста"}</strong>
                  <p className="muted">{formatQuestionMeta(question) || "Без метаданных"}</p>
                </div>
                <Badge tone={isSelected ? "accent" : undefined}>{isSelected ? "Выбран" : question.status ?? "—"}</Badge>
              </button>
            );
          })}
          {!isLoading && !options.length ? (
            <div className="question-picker-empty muted">
              {isError
                ? "Не удалось загрузить вопросы. Попробуйте изменить запрос или обновить страницу."
                : hasInteracted
                  ? "По этому запросу вопросов не найдено."
                  : "Начните поиск, чтобы быстро найти нужный вопрос."}
            </div>
          ) : null}
        </div>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
