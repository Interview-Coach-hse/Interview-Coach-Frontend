import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { normalizeError } from "@/shared/lib/error";
import { Button, Card, Input } from "@/shared/ui";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginMutation } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: LoginValues) {
    await loginMutation.mutateAsync(values);
    navigate(location.state?.from ?? "/app/dashboard");
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Welcome Back</p>
        <h1>Вход</h1>
        <p className="muted">Возобновите тренировку и вернитесь к активной сессии.</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" placeholder="name@example.com" error={errors.email?.message} {...register("email")} />
          <Input label="Пароль" type="password" error={errors.password?.message} {...register("password")} />
          {loginMutation.error ? <p className="field-error">{normalizeError(loginMutation.error).message}</p> : null}
          <Button type="submit" fullWidth disabled={loginMutation.isPending}>
            Войти
          </Button>
        </form>
        <div className="inline-actions" style={{ marginTop: "1rem" }}>
          <Link className="ghost-link" to="/register">
            Регистрация
          </Link>
          <Link className="ghost-link" to="/forgot-password">
            Забыли пароль?
          </Link>
        </div>
      </Card>
    </div>
  );
}
