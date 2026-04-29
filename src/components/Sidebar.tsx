"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Settings, ShieldAlert, Mail, Users, 
  ClipboardList, LogOut, ChevronRight 
} from 'lucide-react';

type SidebarProps = {
  user: {
    nome: string;
    role: string;
    userId: string;
  };
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { href: "/demandas", label: "Demandas", icon: ClipboardList, adminOnly: false },
    { href: "/colaboradores", label: "Colaboradores", icon: Users, adminOnly: true },
    { href: "/gerador-email", label: "Gerador PDF", icon: Mail, adminOnly: false },
    { href: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-[#004b8d] min-h-screen text-white flex flex-col shadow-2xl z-20">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-yellow-500 p-1.5 rounded-lg shadow-inner">
          <ShieldAlert className="w-6 h-6 text-[#004b8d]" />
        </div>
        <span className="text-xl font-black tracking-tight text-white uppercase italic">Pensou</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, adminOnly }) => {
          // Hide admin only items if user is not admin
          if (adminOnly && user.role !== 'admin') return null;

          const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between group px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                active
                  ? "bg-white text-[#004b8d] shadow-lg shadow-black/20 scale-[1.02]"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-[#004b8d]" : "text-blue-300"}`} />
                <span className="text-sm">{label}</span>
              </div>
              {active && <ChevronRight className="w-4 h-4 text-[#004b8d]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/10 bg-black/5">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl mb-4 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-[#004b8d] font-black text-lg shadow-lg border-2 border-white/20">
            {user.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-tight">{user.nome}</span>
            <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold opacity-70">
              {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
            </span>
          </div>
        </div>

        <Link
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/20 hover:text-white transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </Link>
      </div>
    </aside>
  );
}
