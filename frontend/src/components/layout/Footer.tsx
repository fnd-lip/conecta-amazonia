export default function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Conecta Amazônia. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
