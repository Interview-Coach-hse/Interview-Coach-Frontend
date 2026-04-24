import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { InterviewDirection, InterviewLevel, QuestionStatus, QuestionType } from "@/api/generated/schema";
import { adminApi, type ImportResponse } from "@/features/admin/api/admin.api";
import { useAdminQuestions } from "@/features/admin/hooks/useAdmin";
import { normalizeError } from "@/shared/lib/error";
import { directionOptions, levelOptions, questionStatusOptions, questionTypeOptions } from "@/shared/lib/options";
import { Badge, Button, Card, ErrorState, Loader, PageHeader, Select, Textarea, useToast } from "@/shared/ui";

const schema = z.object({
  text: z.string().min(10, "Минимум 10 символов"),
  questionType: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(InterviewLevel),
  direction: z.nativeEnum(InterviewDirection),
  status: z.nativeEnum(QuestionStatus),
});

export function AdminQuestionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const pageSize = 20;
  const { listQuery, createMutation, updateMutation, deleteMutation } = useAdminQuestions({
    page,
    size: pageSize,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const { showToast } = useToast();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: "",
      questionType: QuestionType.Technical,
      difficulty: InterviewLevel.Junior,
      direction: InterviewDirection.Backend,
      status: QuestionStatus.Active,
    },
  });
  const importMutation = useMutation({
    mutationFn: adminApi.importJson,
    onSuccess: () => {
      void listQuery.refetch();
    },
  });
  const importError = importMutation.error ? normalizeError(importMutation.error) : null;
  const exampleJsonHref = useMemo(() => {
    const example = {
      profile: {
        title: "Backend Middle Interview",
        description: "Набор вопросов для backend-собеседования",
        direction: "BACKEND",
        level: "MIDDLE",
        tags: ["spring", "sql", "rest"],
      },
      questions: [
        {
          text: "Что такое ACID в контексте баз данных?",
          questionType: "TECHNICAL",
          difficulty: "MIDDLE",
          direction: "BACKEND",
          status: "ACTIVE",
        },
      ],
    };

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(example, null, 2))}`;
  }, []);

  const resetForm = () => {
    setEditingQuestionId(null);
    reset({
      text: "",
      questionType: QuestionType.Technical,
      difficulty: InterviewLevel.Junior,
      direction: InterviewDirection.Backend,
      status: QuestionStatus.Active,
    });
  };

  const resetImportState = () => {
    setSelectedFile(null);
    setImportResult(null);
    importMutation.reset();
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    resetImportState();
  };

  const handleFileSelected = (file?: File | null) => {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      showToast("Выберите JSON-файл");
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    importMutation.reset();
  };

  if (listQuery.isLoading) {
    return <Loader />;
  }

  if (listQuery.isError) {
    return <ErrorState error={listQuery.error} retry={() => listQuery.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Admin Content"
        title="Вопросы"
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetImportState();
              setShowImportModal(true);
            }}
          >
            Импорт JSON
          </Button>
        }
      />
      <Card>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          {editingQuestionId ? "Режим редактирования вопроса" : "Создание нового вопроса"}
        </p>
        <form
          ref={formRef}
          onSubmit={handleSubmit(async (values) => {
            if (editingQuestionId) {
              await updateMutation.mutateAsync({ id: editingQuestionId, payload: values });
              showToast("Вопрос обновлён");
            } else {
              await createMutation.mutateAsync(values);
              showToast("Вопрос добавлен");
            }

            resetForm();
          })}
        >
          <Textarea label="Текст вопроса" error={errors.text?.message} rows={4} {...register("text")} />
          <div className="grid grid-2">
            <Select label="Тип" error={errors.questionType?.message} options={questionTypeOptions} {...register("questionType")} />
            <Select
              label="Уровень"
              error={errors.difficulty?.message}
              options={levelOptions.filter((item) => item.value)}
              {...register("difficulty")}
            />
            <Select
              label="Направление"
              error={errors.direction?.message}
              options={directionOptions.filter((item) => item.value)}
              {...register("direction")}
            />
            <Select label="Статус" error={errors.status?.message} options={questionStatusOptions} {...register("status")} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingQuestionId ? "Сохранить изменения" : "Добавить вопрос"}
            </Button>
            {editingQuestionId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Отмена
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
      <Card>
        <div className="inline-actions" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
          <p className="muted" style={{ marginBottom: 0 }}>
            Всего вопросов: {listQuery.data?.totalElements ?? 0}
          </p>
          <div className="inline-actions">
            <Button type="button" variant="secondary" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
              Назад
            </Button>
            <Badge>
              {`Страница ${(listQuery.data?.page ?? page) + 1} / ${Math.max(listQuery.data?.totalPages ?? 1, 1)}`}
            </Badge>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= Math.max((listQuery.data?.totalPages ?? 1) - 1, 0)}
              onClick={() => setPage((value) => value + 1)}
            >
              Вперёд
            </Button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Текст</th>
              <th>Тип</th>
              <th>Уровень</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {listQuery.data?.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.text}</td>
                <td>{item.questionType}</td>
                <td>{item.difficulty}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        if (!item.id) {
                          showToast("Не удалось открыть вопрос для редактирования");
                          return;
                        }

                        setEditingQuestionId(item.id);
                        reset({
                          text: item.text ?? "",
                          questionType: item.questionType ?? QuestionType.Technical,
                          difficulty: item.difficulty ?? InterviewLevel.Junior,
                          direction: item.direction ?? InterviewDirection.Backend,
                          status: item.status ?? QuestionStatus.Active,
                        });
                        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        window.setTimeout(() => {
                          setFocus("text");
                        }, 0);
                        showToast("Вопрос загружен в форму");
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={async () => {
                        await deleteMutation.mutateAsync(item.id!);
                        showToast("Вопрос удалён");
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showImportModal ? (
        <div className="modal-backdrop" role="presentation" onClick={closeImportModal}>
          <div className="modal import-modal" role="dialog" aria-modal="true" aria-labelledby="import-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Закрыть" onClick={closeImportModal}>
              ×
            </button>
            <p className="eyebrow">Импорт</p>
            <h3 id="import-modal-title">Импорт JSON</h3>
            <p className="muted">
              Поддерживаются 2 формата: массив вопросов или объект с `profile` и `questions`.
            </p>
            <div className="inline-actions" style={{ marginBottom: "1rem" }}>
              <a href={exampleJsonHref} download="import-example.json" className="ghost-link">
                Скачать пример JSON
              </a>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="import-input-hidden"
              onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className={`import-dropzone ${dragActive ? "import-dropzone-active" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  return;
                }

                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFileSelected(event.dataTransfer.files?.[0] ?? null);
              }}
            >
              <strong>{selectedFile ? selectedFile.name : "Перетащите JSON сюда"}</strong>
              <span className="muted">{selectedFile ? `Размер: ${Math.round(selectedFile.size / 1024)} KB` : "или нажмите, чтобы выбрать файл"}</span>
            </button>
            {importMutation.isError ? (
              <div className="import-error-box">
                <strong>Не удалось импортировать JSON. Проверьте структуру файла.</strong>
                {importError?.message ? <p className="muted" style={{ marginBottom: 0 }}>{importError.message}</p> : null}
              </div>
            ) : null}
            {importResult ? (
              <Card className="import-summary-card">
                <h3 style={{ marginBottom: "0.75rem" }}>{importResult.mode === "PROFILE" ? "Профиль создан" : "Импорт вопросов завершён"}</h3>
                {importResult.mode === "PROFILE" && importResult.profileTitle ? (
                  <p className="muted">Профиль: {importResult.profileTitle}</p>
                ) : null}
                <div className="list" style={{ gap: "0.5rem" }}>
                  <p>Обработано вопросов: {importResult.totalQuestions}</p>
                  <p>Создано новых: {importResult.createdQuestions}</p>
                  <p>Переиспользовано: {importResult.reusedQuestions}</p>
                  {importResult.mode === "PROFILE" ? <p>Привязано к профилю: {importResult.linkedQuestions}</p> : null}
                </div>
                {importResult.mode === "PROFILE" && importResult.profileId ? (
                  <div className="inline-actions" style={{ marginTop: "1rem" }}>
                    <Button
                      type="button"
                      onClick={() => {
                        closeImportModal();
                        navigate(`/admin/profiles/${importResult.profileId}/edit`);
                      }}
                    >
                      Открыть профиль
                    </Button>
                  </div>
                ) : null}
              </Card>
            ) : null}
            <div className="inline-actions" style={{ marginTop: "1rem" }}>
              <Button
                type="button"
                disabled={!selectedFile || importMutation.isPending}
                onClick={async () => {
                  if (!selectedFile) {
                    return;
                  }

                  try {
                    const result = await importMutation.mutateAsync(selectedFile);
                    setImportResult(result);
                    showToast(result.mode === "PROFILE" ? "Импорт профиля завершён" : "Импорт вопросов завершён");
                  } catch {
                    // Error is rendered inline in the modal.
                  }
                }}
              >
                {importMutation.isPending ? "Загружаем..." : "Загрузить"}
              </Button>
              <Button type="button" variant="ghost" onClick={closeImportModal}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
