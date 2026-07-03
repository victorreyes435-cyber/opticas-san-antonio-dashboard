import { LayoutDashboard, Calendar, Users, FileText, Settings, HelpCircle, Eye } from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
}

export default function Sidebar({ activeTab, setActiveTab, userProfile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'prescriptions', label: 'Recetas', icon: FileText },
  ];

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-slate-900 border-r border-slate-800 flex-col py-6 z-20 shadow-xl lg:flex hidden">
      {/* Clinic Identity logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">Ópticas San Antonio</h1>
          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mt-1">Suite Clínica</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <ul className="flex-1 flex flex-col gap-1.5 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white active:scale-98'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Navigation */}
      <div className="mt-auto px-4 border-t border-slate-800 pt-4">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white active:scale-98'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Configuración</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white active:scale-98'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">Soporte</span>
            </button>
          </li>
        </ul>

        {/* Dynamic Practitioner Profile summary */}
        <div className="mt-5 flex items-center space-x-3 px-3 py-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
          <img
            alt="Practitioner Profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"}
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userProfile?.name || "Dr. S. Miller"}</p>
            <p className="text-[10px] text-slate-500 truncate">{userProfile?.role || "Tecnólogo Médico"}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
