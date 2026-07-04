export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
      <span className="text-sm font-semibold tracking-[0.2em] uppercase">
        Wander<span className="text-accent">log</span>
      </span>
      <nav className="flex gap-6 text-sm text-muted">
        <a href="#map" className="transition-colors hover:text-foreground">
          Map
        </a>
        <a href="#about" className="transition-colors hover:text-foreground">
          About
        </a>
      </nav>
    </header>
  );
}
