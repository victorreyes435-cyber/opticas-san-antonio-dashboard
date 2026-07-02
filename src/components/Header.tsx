import { Search, Bell, History, Plus } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewAppointmentClick: () => void;
}

export default function Header({ searchQuery, setSearchQuery, onNewAppointmentClick }: HeaderProps) {
  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 z-10 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 shadow-sm">
      {/* Title & Search bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-800 hidden md:block">
            Gestión Clínica
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold hidden lg:inline-block">
            Sistemas Activos
          </span>
        </div>
        
        {/* Patient Search Input */}
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors font-medium"
            placeholder="Buscar pacientes, IDs o condiciones..."
          />
        </div>
      </div>

      {/* Right area actions */}
      <div className="flex items-center gap-4">
        {/* History Action */}
        <button 
          title="Historial Clínico"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors rounded-full relative active:scale-95"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Notifications Action */}
        <button 
          title="Notificaciones"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors rounded-full relative active:scale-95"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* New Appointment Button */}
        <button
          onClick={onNewAppointmentClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita</span>
        </button>

        {/* Doctor Avatar */}
        <img
          alt="Dr S Miller Avatar"
          className="w-8 h-8 rounded-full object-cover border border-slate-200 ml-1 hover:opacity-90 transition-opacity cursor-pointer"
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  );
}
