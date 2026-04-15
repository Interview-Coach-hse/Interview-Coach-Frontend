import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { Button, Card, Input, PageHeader, Select, useToast } from "@/shared/ui";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredDirection: z.string().optional(),
  preferredLevel: z.string().optional(),
  preferredLanguage: z.string().optional(),
  interfaceLanguage: z.string().optional(),
  theme: z.string().optional(),
});

export function SettingsPage() {
  const { query, updateMutation } = useCurrentUser();
  const { showToast } = useToast();
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (query.data) {
      reset({
        firstName: query.data.firstName ?? "",
        lastName: query.data.lastName ?? "",
        preferredDirection: query.data.preference?.preferredDirection ?? "",
        preferredLevel: query.data.preference?.preferredLevel ?? "",
        preferredLanguage: query.data.preference?.preferredLanguage ?? "ru",
        interfaceLanguage: query.data.preference?.interfaceLanguage ?? "ru",
        theme: query.data.preference?.theme ?? "neon-night",
      });
    }
  }, [query.data, reset]);

  return (
    <div className="grid">
      <PageHeader eyebrow="User Preferences" title="Настройки профиля" />
      <Card>
        <form
          onSubmit={handleSubmit(async (values) => {
            await updateMutation.mutateAsync(values as Parameters<typeof updateMutation.mutate>[0]);
            showToast("Профиль сохранён");
          })}
        >
          <div className="grid grid-2">
            <Input label="Имя" {...register("firstName")} />
            <Input label="Фамилия" {...register("lastName")} />
            <Select label="Предпочтительное направление" options={directionOptions} {...register("preferredDirection")} />
            <Select label="Предпочтительный уровень" options={levelOptions} {...register("preferredLevel")} />
            <Input label="Язык интервью" {...register("preferredLanguage")} />
            <Input label="Язык UI" {...register("interfaceLanguage")} />
          </div>
          <Input label="Тема" {...register("theme")} />
          <Button type="submit" disabled={updateMutation.isPending}>
            Сохранить
          </Button>
        </form>
      </Card>
    </div>
  );
}
