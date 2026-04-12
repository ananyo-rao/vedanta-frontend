interface DevanagariVerseProps {
  verse: string;
}

export function DevanagariVerse({ verse }: DevanagariVerseProps) {
  return (
    <div
      className="rounded-xl bg-surface-container-low p-6 text-center sm:p-8"
      lang="sa"
      aria-label="Sanskrit verse"
    >
      <p className="font-devanagari text-xl leading-loose text-on-surface sm:text-2xl">
        {verse}
      </p>
    </div>
  );
}
