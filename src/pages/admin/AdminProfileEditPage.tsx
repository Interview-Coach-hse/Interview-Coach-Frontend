import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { adminApi } from "@/features/admin/api/admin.api";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { InterviewDirection, InterviewLevel } from "@/api/generated/schema";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { Badge, Button, Card, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  description: z.string().min(10, "Минимум 10 символов"),
  direction: z.nativeEnum(InterviewDirection),
  level: z.nativeEnum(InterviewLevel),
  tags: z.string().optional(),
});

export function AdminProfileEditPage() {
  const { profileId } = useParams();
  const profileQuery = useProfile(profileId);
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

  if (profileId && profileQuery.isLoading) {
    return <Loader />;
  }

  if (profileQuery.isError) {
    return <ErrorState error={profileQuery.error} retry={() => profileQuery.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin Content" title="Редактирование профиля" description="TODO: OpenAPI не содержит endpoint списка/деталей профилей в admin-зоне, поэтому используется public detail как временный источник данных." />
      <Card>
        <form
          onSubmit={handleSubmit(async (values) => {
            const payload = {
              ...values,
              tags: values.tags?.split(",").map((item) => item.trim()).filter(Boolean),
            };

            if (profileId) {
              await adminApi.updateProfile(profileId, payload);
            } else {
              await adminApi.createProfile(payload);
            }
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
            <Button type="submit">Сохранить</Button>
            {profileId ? <Button type="button" variant="secondary" onClick={() => adminApi.publishProfile(profileId)}>Опубликовать</Button> : null}
            {profileId ? <Button type="button" variant="ghost" onClick={() => adminApi.archiveProfile(profileId)}>Архивировать</Button> : null}
          </div>
        </form>
      </Card>
      {profileQuery.data?.questions?.length ? (
        <Card>
          <h2>Profile-question links</h2>
          {profileQuery.data.questions.map((question) => (
            <div key={question.id} className="list-item">
              <div>
                <strong>{question.questionText}</strong>
                <p className="muted">Порядок: {question.orderIndex}</p>
              </div>
              <Badge>{question.required ? "Required" : "Optional"}</Badge>
            </div>
          ))}
        </Card>
      ) : null}
    </div>
  );
}
