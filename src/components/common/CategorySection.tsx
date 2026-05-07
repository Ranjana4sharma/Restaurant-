import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CategorySection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28 lg:scroll-mt-32">
      <div className="relative mb-2.5 text-center sm:mb-3 md:mb-4">
        <h2 className="font-serif text-[11px] font-bold uppercase tracking-[0.3em] text-[#d5b16a] sm:text-xs md:text-sm">
          {title}
        </h2>
        <div
          aria-hidden
          className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-[#d5b16a]/30 to-transparent"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-3 lg:gap-3">
        {children}
      </div>
    </section>
  );
}
