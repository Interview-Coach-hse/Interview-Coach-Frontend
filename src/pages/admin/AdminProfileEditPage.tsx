import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { useAdminProfileEditor } from "@/features/admin/hooks/useAdmin";
import { InterviewDirection, InterviewLevel } from "@/api/generated/schema";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { Badge, Button, Card, ErrorState, Input, Loader, PageHeader, Select, useToast } from "@/shared/ui";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  direction: z.nativeEnum(InterviewDirection),
  level: z.nativeEnum(InterviewLevel),
  tags: z.string().optional(),
});

const linkSchema = z.object({
  questionId: z.string().min(1, "Выберите вопрос"),
  orderIndex: z.coerce.number().int().min(0, "Укажите порядок"),
  required: z.enum(["true", "false"]),
});

export function AdminProfileEditPage() {
  const { profileId } = useParams();
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
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
      title: profileQuery.data?.title ?? "",
      description: profileQuery.data?.description ?? "",
      direction: profileQuery.data?.direction ?? InterviewDirection.Backend,
      level: profileQuery.data?.level ?? InterviewLevel.Junior,
      tags: profileQuery.data?.tags?.join(", ") ?? "",
    }),
    [profileQuery.data],
  );
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: defaults,
  });
  const {
    register: registerLink,
    handleSubmit: handleLinkSubmit,
    reset: resetLinkForm,
    formState: { errors: linkErrors },
  } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      questionId: "",
      orderIndex: 0,
      required: "true",
    },
  });

  const questionOptions = useMemo(
    () => [
      { label: "Выберите вопрос", value: "" },
      ...(questionsQuery.data ?? []).map((question) => ({
        label: question.text ?? "Без текста",
        value: question.id ?? "",
      })),
    ],
    [questionsQuery.data],
  );

  const requiredOptions = [
    { label: "Да", value: "true" },
    { label: "Нет", value: "false" },
  ];

  const resetEditingLink = () => {
    setEditingLinkId(null);
    resetLinkForm({
      questionId: "",
      orderIndex: 0,
      required: "true",
    });
  };

  if (profileId && profileQuery.isLoading) {
    return <Loader />;
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
            };
            await saveMutation.mutateAsync(payload);
            showToast(profileId ? "Профиль обновлён" : "Профиль создан");
          })}
        >
          <Input label="Название" {...register("title")} />
          <Input label="Описание" {...register("description")} />
          <div className="grid grid-2">
            <Select label="Направление" options={directionOptions.filter((item) => item.value)} {...register("direction")} />
            <Select label="Уровень" options={levelOptions.filter((item) => item.value)} {...register("level")} />
          </div>
          <Input label="Теги через запятую" {...register("tags")} />
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
              <Select
                label="Вопрос"
                options={questionOptions}
                error={linkErrors.questionId?.message}
                {...registerLink("questionId")}
              />
              <Input
                label="Порядок"
                type="number"
                error={linkErrors.orderIndex?.message}
                {...registerLink("orderIndex")}
              />
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
