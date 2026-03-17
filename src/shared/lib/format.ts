export function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatScore(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(1)}/10`;
}

export function formatDuration(seconds?: number | null) {
  if (!seconds) {
    return "—";
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}м ${secs}с`;
}
