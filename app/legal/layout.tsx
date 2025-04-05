export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="prose dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
    );
} 