export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col items-center justify-center w-full py-8 md:py-10">
            <div className="w-full max-w-7xl">
                {children}
            </div>
        </section>
    );
} 