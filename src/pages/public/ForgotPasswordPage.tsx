import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "@/features/auth/api/auth.api";
import { Button, Card, Input } from "@/shared/ui";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
});

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Recovery</p>
        <h1>Восстановление пароля</h1>
        <form
          onSubmit={handleSubmit(async (values) => {
            const response = await authApi.requestPasswordReset(values);
            if (response.resetToken) {
              setValue("email", `${values.email} | dev token: ${response.resetToken}`);
            }
          })}
        >
          <Input label="Email" error={errors.email?.message} {...register("email")} />
          <Button type="submit" fullWidth disabled={isSubmitting}>
            Отправить ссылку
          </Button>
        </form>
      </Card>
    </div>
  );
}
