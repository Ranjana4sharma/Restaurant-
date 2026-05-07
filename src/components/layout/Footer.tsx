interface FooterProps {
  isLoading?: boolean;
}

export function Footer({ isLoading = false }: FooterProps) {
  return (
    <footer className="border-t border-[#d5b16a]/10 bg-[#070707] px-6 py-10 text-[#f3e8c7] sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2">
        <div className="mb-4 h-px w-20 bg-gradient-to-r from-transparent via-[#d5b16a]/40 to-transparent" />
        <p className="font-logo text-xs uppercase tracking-[0.2em] text-[#d5b16a]/60">
          Designed By
        </p>
        <p className="font-serif text-2xl font-bold uppercase tracking-widest text-[#d5b16a] sm:text-3xl">
          Rs entrprise
        </p>
        <p className="mt-1 max-w-md text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5b16a]/50 sm:text-xs">
          Restaurant Management Partner
        </p>
        <div className="mt-8 text-[9px] uppercase tracking-[0.1em] text-[#d5b16a]/30">
          © {new Date().getFullYear()} The Royal Platter. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
