export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`text-lg font-bold tracking-tight ${className}`}>
      scor<span className="text-accent">vio</span>
      <span className="text-muted-foreground font-medium">.ai</span>
    </span>
  );
}