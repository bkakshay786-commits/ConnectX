interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--cx-wash-violet),transparent)]"
      />
      <img alt="" className="relative h-16 w-16" src="/brand/connectx-mark.svg" />
      <h1 className="relative mt-6 font-display text-3xl font-extrabold tracking-tight text-cx-text">
        Connect<span className="text-primary">X</span>
      </h1>
      <p className="relative mt-2 font-display text-lg font-semibold text-cx-text">{title}</p>
      <p className="relative mt-2 max-w-md text-center font-body text-sm leading-relaxed text-cx-muted">
        {description}
      </p>
    </main>
  );
}
