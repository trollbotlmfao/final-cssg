import { Navbar } from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="md:pl-16 lg:pl-64 min-h-screen pb-16 md:pb-0">
        <div className="container max-w-4xl mx-auto py-4 px-4 md:py-6 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
} 