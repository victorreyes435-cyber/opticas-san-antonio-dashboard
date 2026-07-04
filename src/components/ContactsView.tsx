import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, RefreshCw, Phone, Mail, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Contact {
  resourceName: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  org?: string;
}

export default function ContactsView() {
  const { googleToken, signIn } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Contact Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (googleToken) {
      fetchContacts();
    }
  }, [googleToken]);

  const fetchContacts = async (query = '') => {
    if (!googleToken) return;
    setLoading(true);
    setError(null);
    try {
      let url = 'https://people.googleapis.com/v1/people/me/connections?pageSize=50&personFields=names,emailAddresses,phoneNumbers,photos,organizations';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });

      if (!res.ok) {
        throw new Error('Error de conexión con Google Contacts.');
      }

      const data = await res.json();
      const rawConnections = data.connections || [];
      
      const formatted: Contact[] = rawConnections.map((person: any) => {
        const nameObj = person.names?.[0];
        const emailObj = person.emailAddresses?.[0];
        const phoneObj = person.phoneNumbers?.[0];
        const photoObj = person.photos?.[0];
        const orgObj = person.organizations?.[0];

        return {
          resourceName: person.resourceName,
          name: nameObj?.displayName || 'Contacto sin Nombre',
          email: emailObj?.value || undefined,
          phone: phoneObj?.value || undefined,
          photoUrl: photoObj?.url || undefined,
          org: orgObj?.name || undefined
        };
      });

      // Simple client side filter if search query is provided
      if (query.trim()) {
        const term = query.toLowerCase();
        setContacts(formatted.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.email?.toLowerCase().includes(term) || 
          c.phone?.includes(term)
        ));
      } else {
        setContacts(formatted);
      }
    } catch (err: any) {
      console.error(err);
      setError('No se pudo sincronizar la libreta de contactos de Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts(searchQuery);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken || !firstName.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        names: [{ givenName: firstName, familyName: lastName }]
      };

      if (email.trim()) {
        payload.emailAddresses = [{ value: email }];
      }

      if (phone.trim()) {
        payload.phoneNumbers = [{ value: phone }];
      }

      const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Error al guardar el nuevo contacto');
      }

      setSuccess('¡Contacto guardado con éxito en Google Contacts!');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setShowAddModal(false);
      
      setTimeout(() => setSuccess(null), 3000);
      fetchContacts();
    } catch (err: any) {
      console.error(err);
      setError('Fallo al crear el contacto en Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (resourceName: string, name: string) => {
    if (!googleToken) return;
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar a "${name}" de Google Contacts?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${googleToken}` }
      });

      if (!res.ok) {
        throw new Error('Error al eliminar contacto de Google');
      }

      setContacts(prev => prev.filter(c => c.resourceName !== resourceName));
      setSuccess(`Contacto "${name}" eliminado.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(`No se pudo eliminar el contacto "${name}".`);
    } finally {
      setLoading(false);
    }
  };

  if (!googleToken) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto my-12 text-xs">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Libreta de Contactos de Google</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            Importa pacientes, mantén actualizada la lista de proveedores, convenios ópticos y laboratorios clínicos sincronizándolos con tus Google Contacts de manera fluida.
          </p>
        </div>
        <button
          onClick={signIn}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Users className="w-4 h-4 text-white" />
          <span>Conectar con Google Contacts</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Directorio de Pacientes y Contactos (Google)</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 mt-1">Sincroniza y actualiza la libreta de contactos clínicos con tu cuenta oficial de Google.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Contacto Google</span>
          </button>
          <button
            onClick={() => fetchContacts()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Sincronizar directorio"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-800 dark:text-red-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Grid of Contacts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="Buscar contactos por nombre, correo, teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Buscando contactos en Google Contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-750" />
            <p className="font-bold text-sm">No se encontraron contactos en Google</p>
            <p className="text-[10px] max-w-sm mx-auto">Comienza agregando tu primer contacto médico o personal con el botón superior para sincronizarlo con Google.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contacts.map((contact) => (
              <div
                key={contact.resourceName}
                className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-3.5 hover:shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
              >
                <img
                  alt={contact.name}
                  src={contact.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-750"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{contact.name}</h4>
                  {contact.org && <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">{contact.org}</p>}
                  
                  <div className="space-y-1 mt-2.5">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteContact(contact.resourceName, contact.name)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer self-start"
                  title="Eliminar de Google"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Registrar Contacto en Google</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Registra un nuevo contacto clínico, paciente o proveedor. Se guardará de inmediato en tu libreta oficial de Google Contacts.
            </p>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase text-[10px]">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase text-[10px]">Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej. Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase text-[10px]">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="juan.perez@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase text-[10px]">Teléfono</label>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Sincronizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
