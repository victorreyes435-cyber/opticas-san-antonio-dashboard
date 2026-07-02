import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'prescriptions', label: 'Recetas', icon: FileText },
    { id: 'settings', label: 'Ajustes', icon: Settings },
    { id: 'support', label: 'Soporte', icon: HelpCircle },
  ];

  return (
    <div id="bottom-nav-bar-container" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-2 py-1.5 z-40 lg:hidden block">
      <nav className="max-w-md mx-auto flex justify-between items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`bottom-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-lg relative transition-all active:scale-90 flex-1 min-w-0"
            >
              <div className="relative p-1">
                {isActive && (
                  <motion.span
                    layoutId="activeBottomTabPill"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 truncate max-w-full ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                {item.id === 'prescriptions' ? 'Rx' : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
