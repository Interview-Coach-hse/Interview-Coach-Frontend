import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { adminApi } from "@/features/admin/api/admin.api";
import { useAdminUser } from "@/features/admin/hooks/useAdmin";
import { directionOptions, levelOptions, userStatusOptions } from "@/shared/lib/options";
import { Button, Card, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

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
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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
        <form onSubmit={handleSubmit((values) => adminApi.updateUser(userId!, values as Parameters<typeof adminApi.updateUser>[1]))}>
          <div className="grid grid-2">
            <Input label="Email" {...register("email")} />
            <Input label="Роль" {...register("roleCode")} />
            <Input label="Имя" {...register("firstName")} />
            <Input label="Фамилия" {...register("lastName")} />
            <Select label="Статус" options={userStatusOptions} {...register("status")} />
            <Select label="Направление" options={directionOptions} {...register("preferredDirection")} />
            <Select label="Уровень" options={levelOptions} {...register("preferredLevel")} />
          </div>
          <Button type="submit">Сохранить</Button>
        </form>
      </Card>
    </div>
  );
}
