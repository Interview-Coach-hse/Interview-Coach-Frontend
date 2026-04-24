import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authStore } from "@/features/auth/hooks/auth-store";
import { useCatalogs } from "@/features/catalogs/hooks/useCatalogs";
import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { Button, Card, ErrorState, Input, Loader, PageHeader, Select, useToast } from "@/shared/ui";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredDirection: z.string().optional(),
  preferredLevel: z.string().optional(),
});

export function SettingsPage() {
  const navigate = useNavigate();
  const clearSession = authStore((state) => state.clearSession);
  const { directionOptions, levelOptions, isLoading: catalogsLoading, isError: catalogsError, error: catalogsErrorValue } = useCatalogs();
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
      });
    }
  }, [query.data, reset]);

  if (query.isLoading || catalogsLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  }

  if (catalogsError) {
    return <ErrorState error={catalogsErrorValue} retry={() => window.location.reload()} />;
  }

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
          </div>
          <div className="inline-actions">
            <Button type="submit" disabled={updateMutation.isPending}>
              Сохранить
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                clearSession();
                navigate("/login");
              }}
            >
              Выйти
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
