import { useEffect, useState } from "react";
import { normalizeError } from "@/shared/lib/error";
import { Button } from "@/shared/ui/Button";

export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const normalized = normalizeError(error);

  useEffect(() => {
    setIsDismissed(false);
  }, [error]);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="modal-backdrop error-backdrop">
      <div className="modal error-modal" role="alertdialog" aria-modal="false" aria-labelledby="error-modal-title">
        <button className="modal-close" type="button" aria-label="Закрыть" onClick={() => setIsDismissed(true)}>
          ×
        </button>
        <p className="eyebrow">Ошибка</p>
        <h3 id="error-modal-title">{normalized.title}</h3>
        <p className="muted">{normalized.message}</p>
        {normalized.fields ? (
          <div className="state state-error" style={{ padding: "0.5rem 0 0", placeItems: "start", textAlign: "left" }}>
            {Object.entries(normalized.fields).map(([field, message]) => (
              <p key={field} className="field-error">{field}: {message}</p>
            ))}
          </div>
        ) : null}
        {retry ? (
          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <Button onClick={retry}>Повторить</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
