import { normalizeError } from "@/shared/lib/error";
import { Button } from "@/shared/ui/Button";

export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const normalized = normalizeError(error);

  return (
    <div className="state state-error">
      <p className="eyebrow">Ошибка</p>
      <h3>{normalized.title}</h3>
      <p className="muted">{normalized.message}</p>
      {retry ? <Button onClick={retry}>Повторить</Button> : null}
    </div>
  );
}
