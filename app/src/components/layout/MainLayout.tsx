import { ModeToggle } from '../theme/mode-toggle';
import { Badge } from "../ui/badge";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function MainLayout({ children, isLoading = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">RandoriDoctor</h1>
            <Badge variant="outline" className="bg-primary/10">Beta</Badge>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
          </div>
        ) : (
          children
        )}
      </main>
      
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
         RandoriDoctor 🩺
        </div>
      </footer>
    </div>
  );
}