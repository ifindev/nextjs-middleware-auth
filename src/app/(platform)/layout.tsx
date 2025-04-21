import Navigation from '@/components/navigation';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col gap-2">
                <Navigation />
                {children}
            </div>
        </section>
    );
}
