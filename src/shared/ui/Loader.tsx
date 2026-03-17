export function Loader({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div className="state">
      <div className="loader" />
      <p>{label}</p>
    </div>
  );
}
