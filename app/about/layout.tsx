export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4 bg-[#F5F7FA]">
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </section>
  );
}
