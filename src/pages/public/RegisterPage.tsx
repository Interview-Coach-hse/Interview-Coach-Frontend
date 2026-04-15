import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api/auth.api";
import { Button, Card, ErrorState, Input } from "@/shared/ui";

const schema = z
  .object({
    email: z.string().email("Введите корректный email"),
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string().min(8, "Повторите пароль"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const response = await authApi.register({
        email: values.email,
        password: values.password,
      });
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}&code=${response.code ?? ""}`);
    } catch (error) {
      setSubmitError(error);
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Start Strong</p>
        <h1>Регистрация</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" placeholder="name@example.com" error={errors.email?.message} {...register("email")} />
          <Input label="Пароль" type="password" error={errors.password?.message} {...register("password")} />
          <Input
            label="Повтор пароля"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" fullWidth disabled={isSubmitting}>
            Создать аккаунт
          </Button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          Уже есть аккаунт?{" "}
          <Link className="ghost-link" to="/login">
            Войти
          </Link>
        </p>
      </Card>
      {submitError ? <ErrorState error={submitError} /> : null}
    </div>
  );
}
