"use client";

import { cn } from "@/lib/utils";
import { Home, PlusSquare, Search, User, Sun, Moon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const supabase = createClient();
  
  const routes = [
    {
      href: "/",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/search",
      icon: Search,
      active: pathname === "/search"
    },
    {
      href: "/create",
      icon: PlusSquare,
      active: pathname === "/create"
    },
    {
      href: "/profile",
      icon: User,
      active: pathname === "/profile"
    }
  ];
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="fixed bottom-0 w-full border-t border-border bg-background p-2 md:border-r md:border-t-0 md:top-0 md:h-full md:w-16 lg:w-64">
      <div className="flex h-full flex-row items-center justify-between md:flex-col md:items-start md:justify-start md:space-y-4">
        <div className="hidden md:block p-4">
          <Link href="/">
            <div className="hidden lg:flex">
              <h1 className="text-xl font-bold">Instagram Clone</h1>
            </div>
            <div className="hidden md:flex lg:hidden">
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
            </div>
          </Link>
        </div>
        
        <div className="flex w-full flex-row justify-around md:flex-col md:items-start md:space-y-2 md:p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-4 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-primary/10",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="hidden lg:block">
                {route.href === "/" && "Home"}
                {route.href === "/search" && "Search"}
                {route.href === "/create" && "Create"}
                {route.href === "/profile" && "Profile"}
              </span>
            </Link>
          ))}
          
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className={cn(
              "flex items-center gap-4 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-primary/10",
              "text-muted-foreground"
            )}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="hidden lg:block">{isDark ? "Light" : "Dark"}</span>
          </button>
          
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={cn(
              "flex items-center gap-4 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-primary/10",
              "text-muted-foreground"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
} 