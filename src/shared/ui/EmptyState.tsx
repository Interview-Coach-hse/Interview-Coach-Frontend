import { Button } from "@/shared/ui/Button";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="state">
      <p className="eyebrow">Empty</p>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
