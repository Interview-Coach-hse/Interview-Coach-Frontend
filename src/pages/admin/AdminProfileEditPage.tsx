import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAdminProfileEditor } from "@/features/admin/hooks/useAdmin";
import { useCatalogs } from "@/features/catalogs/hooks/useCatalogs";
import { Badge, Button, Card, ErrorState, Input, Loader, PageHeader, QuestionPicker, Select, Textarea, useToast } from "@/shared/ui";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  direction: z.string().min(1, "Выберите направление"),
  level: z.string().min(1, "Выберите уровень"),
  tags: z.string().optional(),
});

const linkSchema = z.object({
  questionId: z.string().min(1, "Выберите вопрос"),
  orderIndex: z.coerce.number().int().min(0, "Укажите порядок"),
  required: z.enum(["true", "false"]),
});

export function AdminProfileEditPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const { directionSelectOptions, levelSelectOptions, isLoading: catalogsLoading, isError: catalogsError, error: catalogsErrorValue } = useCatalogs();
  const { showToast } = useToast();
  const {
    profileQuery,
    linksQuery,
    questionsQuery,
    saveMutation,
    publishMutation,
    archiveMutation,
    addLinkMutation,
    updateLinkMutation,
    deleteLinkMutation,
  } = useAdminProfileEditor(profileId);
  const defaults = useMemo(
    () => ({
      title: "",
      description: "",
      direction: "",
      level: "",
      tags: "",
    }),
    [],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const {
    register: registerLink,
    handleSubmit: handleLinkSubmit,
    reset: resetLinkForm,
    setValue: setLinkValue,
    watch: watchLink,
    formState: { errors: linkErrors },
  } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      questionId: "",
      orderIndex: 0,
      required: "true",
    },
  });

  const requiredOptions = [
    { label: "Да", value: "true" },
    { label: "Нет", value: "false" },
  ];
  const selectedQuestionId = watchLink("questionId");
  const nextOrderIndex = useMemo(() => {
    const values = (linksQuery.data ?? [])
      .map((item) => item.orderIndex ?? -1)
      .filter((value) => value >= 0);

    if (!values.length) {
      return 0;
    }

    return Math.max(...values) + 1;
  }, [linksQuery.data]);

  const resetEditingLink = () => {
    setEditingLinkId(null);
    resetLinkForm({
      questionId: "",
      orderIndex: nextOrderIndex,
      required: "true",
    });
  };

  useEffect(() => {
    if (!profileQuery.data) {
      reset(defaults);
      return;
    }

    reset({
      title: profileQuery.data.title ?? "",
      description: profileQuery.data.description ?? "",
      direction: profileQuery.data.direction ?? "",
      level: profileQuery.data.level ?? "",
      tags: profileQuery.data.tags?.join(", ") ?? "",
    });
  }, [defaults, profileQuery.data, reset]);

  useEffect(() => {
    if (editingLinkId) {
      return;
    }

    resetLinkForm({
      questionId: "",
      orderIndex: nextOrderIndex,
      required: "true",
    });
  }, [editingLinkId, nextOrderIndex, resetLinkForm]);

  if (profileId && profileQuery.isLoading) {
    return <Loader />;
  }

  if (catalogsLoading) {
    return <Loader />;
  }

  if (catalogsError) {
    return <ErrorState error={catalogsErrorValue} retry={() => window.location.reload()} />;
  }

  if (profileQuery.isError || linksQuery.isError || questionsQuery.isError) {
    return <ErrorState error={profileQuery.error ?? linksQuery.error ?? questionsQuery.error} retry={() => {
      void profileQuery.refetch();
      void linksQuery.refetch();
      void questionsQuery.refetch();
    }} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin Content" title="Редактирование профиля" />
      <Card>
        <form
          onSubmit={handleSubmit(async (values) => {
            const payload = {
              ...values,
              tags: values.tags?.split(",").map((item) => item.trim()).filter(Boolean),
            } as Parameters<typeof saveMutation.mutateAsync>[0];
            const savedProfile = await saveMutation.mutateAsync(payload);
            showToast(profileId ? "Профиль обновлён" : "Профиль создан");

            if (!profileId && savedProfile.id) {
              navigate(`/admin/profiles/${savedProfile.id}/edit`, { replace: true });
            }
          })}
        >
          <Input label="Название" error={errors.title?.message} {...register("title")} />
          <Textarea label="Описание" rows={5} error={errors.description?.message} {...register("description")} />
          <div className="grid grid-2">
            <Select
              label="Направление"
              error={errors.direction?.message}
              options={directionSelectOptions}
              {...register("direction")}
            />
            <Select
              label="Уровень"
              error={errors.level?.message}
              options={levelSelectOptions}
              {...register("level")}
            />
          </div>
          <Input label="Теги через запятую" error={errors.tags?.message} {...register("tags")} />
          <div className="inline-actions">
            <Button type="submit" disabled={saveMutation.isPending}>
              Сохранить
            </Button>
            {profileId ? (
              <Button
                type="button"
                variant="secondary"
                disabled={publishMutation.isPending}
                onClick={async () => {
                  await publishMutation.mutateAsync();
                  showToast("Профиль опубликован");
                }}
              >
                Опубликовать
              </Button>
            ) : null}
            {profileId ? (
              <Button
                type="button"
                variant="ghost"
                disabled={archiveMutation.isPending}
                onClick={async () => {
                  await archiveMutation.mutateAsync();
                  showToast("Профиль отправлен в архив");
                }}
              >
                Архивировать
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
      {saveMutation.isError ? <ErrorState error={saveMutation.error} /> : null}
      {publishMutation.isError ? <ErrorState error={publishMutation.error} /> : null}
      {archiveMutation.isError ? <ErrorState error={archiveMutation.error} /> : null}
      {addLinkMutation.isError ? <ErrorState error={addLinkMutation.error} /> : null}
      {updateLinkMutation.isError ? <ErrorState error={updateLinkMutation.error} /> : null}
      {deleteLinkMutation.isError ? <ErrorState error={deleteLinkMutation.error} /> : null}
      {profileId ? (
        <Card>
          <h2>Связи вопросов</h2>
          <form
            onSubmit={handleLinkSubmit(async (values) => {
              const payload = {
                questionId: values.questionId,
                orderIndex: values.orderIndex,
                required: values.required === "true",
              };

              if (editingLinkId) {
                await updateLinkMutation.mutateAsync({ linkId: editingLinkId, payload });
                showToast("Связь вопроса обновлена");
              } else {
                await addLinkMutation.mutateAsync({ profileId, payload });
                showToast("Вопрос добавлен в профиль");
              }

              resetEditingLink();
            })}
          >
            <div className="grid grid-2">
              <div style={{ gridColumn: "1 / -1" }}>
                <input type="hidden" {...registerLink("questionId")} />
                <QuestionPicker
                  value={selectedQuestionId}
                  excludeProfileId={profileId}
                  initialData={questionsQuery.data}
                  error={linkErrors.questionId?.message}
                  disabled={addLinkMutation.isPending || updateLinkMutation.isPending}
                  onChange={(questionId) => {
                    setLinkValue("questionId", questionId, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
              <Input
                label="Порядок"
                type="number"
                error={linkErrors.orderIndex?.message}
                {...registerLink("orderIndex")}
              />
              <p className="muted" style={{ margin: "-0.25rem 0 0" }}>
                По умолчанию подставляется следующий номер, но его можно изменить вручную.
              </p>
              <Select
                label="Обязательный"
                options={requiredOptions}
                error={linkErrors.required?.message}
                {...registerLink("required")}
              />
            </div>
            <div className="inline-actions">
              <Button type="submit" disabled={addLinkMutation.isPending || updateLinkMutation.isPending}>
                {editingLinkId ? "Сохранить связь" : "Добавить вопрос"}
              </Button>
              {editingLinkId ? (
                <Button type="button" variant="secondary" onClick={resetEditingLink}>
                  Отмена
                </Button>
              ) : null}
            </div>
          </form>
          <div className="list" style={{ marginTop: "1rem" }}>
            {linksQuery.data?.map((question) => (
              <div key={question.id} className="list-item">
                <div>
                  <strong>{question.questionText}</strong>
                  <p className="muted">Порядок: {question.orderIndex}</p>
                </div>
                <div className="inline-actions">
                  <Badge>{question.required ? "Required" : "Optional"}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingLinkId(question.id ?? null);
                      resetLinkForm({
                        questionId: question.questionId ?? "",
                        orderIndex: question.orderIndex ?? 0,
                        required: question.required ? "true" : "false",
                      });
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!question.id || deleteLinkMutation.isPending}
                    onClick={async () => {
                      if (!question.id) {
                        return;
                      }

                      await deleteLinkMutation.mutateAsync(question.id);
                      showToast("Связь вопроса удалена");
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="muted">Сначала сохраните профиль, после этого можно будет привязывать к нему вопросы.</p>
        </Card>
      )}
    </div>
  );
}
