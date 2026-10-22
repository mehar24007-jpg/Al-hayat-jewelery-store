export default function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <p role={error ? "alert" : "status"} className={`mb-4 rounded-lg border px-3 py-2 text-sm ${error ? "border-warn text-warn" : "border-ok text-ok"}`}>
      {error || ok}
    </p>
  );
}
