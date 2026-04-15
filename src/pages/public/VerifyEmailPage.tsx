import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api/auth.api";
import { Button, Card, ErrorState, Input } from "@/shared/ui";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Введите код подтверждения"),
});

type VerifyValues = z.infer<typeof schema>;

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [submitError, setSubmitError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: params.get("email") ?? "",
      code: params.get("code") ?? "",
    },
  });

  async function onSubmit(values: VerifyValues) {
    try {
      await authApi.verifyEmailConfirm(values);
    } catch (error) {
      setSubmitError(error);
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Verify</p>
        <h1>Подтверждение email</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" error={errors.email?.message} {...register("email")} />
          <Input label="Код" error={errors.code?.message} {...register("code")} />
          <div className="inline-actions">
            <Button type="submit" disabled={isSubmitting}>
              Подтвердить
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const email = params.get("email");
                if (email) {
                  await authApi.verifyEmailRequest({ email });
                }
              }}
            >
              Отправить код повторно
            </Button>
          </div>
        </form>
      </Card>
      {submitError ? <ErrorState error={submitError} /> : null}
    </div>
  );
}
