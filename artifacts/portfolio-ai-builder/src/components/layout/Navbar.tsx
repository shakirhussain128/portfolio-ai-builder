import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Wand2, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <nav className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-50 relative">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-sm tracking-tight">PortFolioGen<span className="text-primary">.AI</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        )}

        <div className="h-4 w-px bg-border mx-2" />

        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block">
                {user?.firstName || 'User'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={() => login()}>
            <LogIn className="w-4 h-4 mr-2" />
            Login to Save
          </Button>
        )}
      </div>
    </nav>
  );
}
