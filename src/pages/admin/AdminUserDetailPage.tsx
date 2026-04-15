import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { adminApi } from "@/features/admin/api/admin.api";
import { useAdminUser } from "@/features/admin/hooks/useAdmin";
import { directionOptions, levelOptions, userStatusOptions } from "@/shared/lib/options";
import { Button, Card, ErrorState, Input, Loader, PageHeader, Select, useToast } from "@/shared/ui";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.string().optional(),
  roleCode: z.string().optional(),
  preferredDirection: z.string().optional(),
  preferredLevel: z.string().optional(),
});

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const query = useAdminUser(userId);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const updateUserMutation = useMutation({
    mutationFn: (values: Parameters<typeof adminApi.updateUser>[1]) => adminApi.updateUser(userId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  useEffect(() => {
    if (query.data) {
      reset({
        email: query.data.email ?? "",
        firstName: query.data.firstName ?? "",
        lastName: query.data.lastName ?? "",
        status: query.data.status ?? "",
        roleCode: query.data.roleCode ?? "",
        preferredDirection: query.data.preference?.preferredDirection ?? "",
        preferredLevel: query.data.preference?.preferredLevel ?? "",
      });
    }
  }, [query.data, reset]);

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin User" title={query.data?.email ?? "Пользователь"} />
      <Card>
        <form
          onSubmit={handleSubmit(async (values) => {
            await updateUserMutation.mutateAsync(values as Parameters<typeof adminApi.updateUser>[1]);
            showToast("Пользователь сохранён");
          })}
        >
          <div className="grid grid-2">
            <Input label="Email" {...register("email")} />
            <Input label="Роль" {...register("roleCode")} />
            <Input label="Имя" {...register("firstName")} />
            <Input label="Фамилия" {...register("lastName")} />
            <Select label="Статус" options={userStatusOptions} {...register("status")} />
            <Select label="Направление" options={directionOptions} {...register("preferredDirection")} />
            <Select label="Уровень" options={levelOptions} {...register("preferredLevel")} />
          </div>
          <Button type="submit" disabled={updateUserMutation.isPending}>Сохранить</Button>
        </form>
      </Card>
      {updateUserMutation.isError ? <ErrorState error={updateUserMutation.error} /> : null}
    </div>
  );
}
