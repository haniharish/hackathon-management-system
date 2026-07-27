export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-forest/70">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest/20 border-t-forest" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
