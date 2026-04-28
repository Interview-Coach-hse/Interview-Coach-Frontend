import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api/auth.api";
import { Button, Card, ErrorState, Input, useToast } from "@/shared/ui";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Введите код подтверждения"),
});

type VerifyValues = z.infer<typeof schema>;

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isVerified, setIsVerified] = useState(false);
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

  useEffect(() => {
    if (!isVerified) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isVerified, navigate]);

  async function onSubmit(values: VerifyValues) {
    try {
      setSubmitError(null);
      await authApi.verifyEmailConfirm(values);
      showToast("Email подтвержден");
      setIsVerified(true);
    } catch (error) {
      setSubmitError(error);
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        {isVerified ? (
          <div className="state">
            <p className="eyebrow">Success</p>
            <h1>Email подтвержден</h1>
            <p className="muted">Перенаправляем вас на страницу входа...</p>
            <div className="inline-actions" style={{ justifyContent: "center" }}>
              <Button type="button" onClick={() => navigate("/login", { replace: true })}>
                Перейти ко входу
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                      showToast("Код отправлен повторно");
                    }
                  }}
                >
                  Отправить код повторно
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
      {submitError ? <ErrorState error={submitError} /> : null}
    </div>
  );
}
