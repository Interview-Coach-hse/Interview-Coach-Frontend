import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api/auth.api";
import { Button, Card, ErrorState, Input } from "@/shared/ui";

const schema = z.object({
  token: z.string().min(1, "Введите token"),
  newPassword: z.string().min(8, "Минимум 8 символов"),
});

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [submitError, setSubmitError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: params.get("token") ?? "",
    },
  });

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Reset</p>
        <h1>Новый пароль</h1>
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await authApi.confirmPasswordReset(values);
            } catch (error) {
              setSubmitError(error);
            }
          })}
        >
          <Input label="Token" error={errors.token?.message} {...register("token")} />
          <Input label="Новый пароль" type="password" error={errors.newPassword?.message} {...register("newPassword")} />
          <Button type="submit" fullWidth disabled={isSubmitting}>
            Сохранить пароль
          </Button>
        </form>
      </Card>
      {submitError ? <ErrorState error={submitError} /> : null}
    </div>
  );
}
