/**
 * Layout principal com sidebar colapsável em desktop e bottom navigation em mobile
 * Design: Minimalismo Corporativo Moderno
 */

import { Link, useLocation } from "react-router-dom";
import { Package, Plus, ListChecks, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.webp";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: "Produtos",
    href: "/produtos",
    icon: Package,
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Plus,
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ListChecks,
  },
  {
    label: "Movimentações",
    href: "/movimentacoes",
    icon: TrendingDown,
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Apenas em desktop */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-background flex flex-col">
          {/* Header com logo */}
          <div className="p-4 border-b border-border bg-black">
            <Link to="/produtos">
              <a className="flex items-center gap-2 flex-col">
                <img src={logo} alt="Socks Co." className="h-12 w-auto" />{" "}
                <div>
                  <p className="text-md text-neutral-400 font-bold tracking-wide">
                    Gestão de Estoque
                  </p>
                </div>
              </a>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.state === item.href;

                return (
                  <li key={item.href}>
                    <Link to={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          "hover:bg-secondary text-foreground",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="font-medium text-sm">{item.label}</div>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile com logo */}
        {isMobile && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background bg-black">
            <img src={logo} alt="Socks Co." className="h-6 w-auto" />
          </div>
        )}

        {/* Conteúdo */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            isMobile && "pb-20" // Espaço para bottom nav
          )}
        >
          <div className="p-4 sm:p-6 md:p-8">{children}</div>
        </div>
      </main>

      {/* Bottom Navigation - Apenas em mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
          <div className="flex items-center justify-around">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.state === item.href;

              return (
                <Link key={item.href} to={item.href}>
                  <a
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-colors",
                      "hover:bg-secondary",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
