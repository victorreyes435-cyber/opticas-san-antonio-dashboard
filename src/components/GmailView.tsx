import React, { useState, useEffect } from 'react';
import { Mail, Send, Search, RefreshCw, ChevronRight, User, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GmailMessage {
  id: string;
  threadId: string;
}

interface MessageDetail {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

export default function GmailView() {
  const { googleToken, signIn } = useAuth();
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New mail state
  const [isComposing, setIsComposing] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (googleToken) {
      fetchInbox();
    }
  }, [googleToken]);

  const fetchInbox = async (query = '') => {
    if (!googleToken) return;
    setLoading(true);
    setError(null);
    try {
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8';
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }
      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (!listRes.ok) {
        throw new Error('Error al cargar correos. Por favor reconecta.');
      }
      const listData = await listRes.json();
      
      if (!listData.messages || listData.messages.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Fetch details of each message in parallel
      const detailPromises = listData.messages.map(async (msg: GmailMessage) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
          headers: { Authorization: `Bearer ${googleToken}` }
        });
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();

        // Extract headers
        const headers = detail.payload.headers;
        const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
        const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');

        // Extract body
        let body = '';
        if (detail.payload.parts) {
          const textPart = detail.payload.parts.find((part: any) => part.mimeType === 'text/plain') || detail.payload.parts[0];
          if (textPart && textPart.body && textPart.body.data) {
            body = decodeBase64(textPart.body.data);
          }
        } else if (detail.payload.body && detail.payload.body.data) {
          body = decodeBase64(detail.payload.body.data);
        }

        return {
          id: detail.id,
          snippet: detail.snippet,
          subject: subjectHeader ? subjectHeader.value : '(Sin Asunto)',
          from: fromHeader ? fromHeader.value : 'Desconocido',
          date: dateHeader ? new Date(dateHeader.value).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'Reciente',
          body: body || detail.snippet
        } as MessageDetail;
      });

      const detailedMessages = await Promise.all(detailPromises);
      setMessages(detailedMessages.filter((m): m is MessageDetail => m !== null));
    } catch (err: any) {
      console.error(err);
      setError('Error al obtener la bandeja de Gmail. Asegúrate de tener permisos activos.');
    } finally {
      setLoading(false);
    }
  };

  const decodeBase64 = (data: string) => {
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      return '';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInbox(searchQuery);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken || !toEmail.trim() || !subject.trim() || !emailBody.trim()) return;

    setSending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
      const emailParts = [
        `To: ${toEmail}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        emailBody.replace(/\n/g, '<br/>')
      ];

      const emailRaw = emailParts.join('\r\n');
      const base64Safe = btoa(unescape(encodeURIComponent(emailRaw)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64Safe })
      });

      if (!res.ok) {
        throw new Error('Error al enviar el correo');
      }

      setSuccessMsg('¡Correo enviado con éxito!');
      setToEmail('');
      setSubject('');
      setEmailBody('');
      setIsComposing(false);
      
      // Auto close success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Refresh inbox
      fetchInbox();
    } catch (err: any) {
      console.error(err);
      setError('Fallo al enviar el correo a través de Gmail.');
    } finally {
      setSending(false);
    }
  };

  if (!googleToken) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
          <Mail className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bandeja de Correo (Gmail)</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
            Para ver correos clínicos de pacientes, responder consultas o enviar recetas médicas de manera segura, debes conectar tu cuenta de Google.
          </p>
        </div>
        <button
          onClick={signIn}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 text-xs cursor-pointer"
        >
          <Mail className="w-4 h-4 text-white" />
          <span>Conectar con Google Gmail</span>
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
            <Mail className="w-5 h-5 text-indigo-600" />
            <span>Gestión de Correo Clínico (Gmail)</span>
          </h2>
          <p className="text-slate-400 mt-1 dark:text-slate-500">Envía recetas e informes clínicos, y atiende las consultas de tus pacientes directamente.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComposing(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 text-xs"
          >
            <Send className="w-4 h-4" />
            <span>Redactar Correo</span>
          </button>
          <button
            onClick={() => fetchInbox()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Sincronizar bandeja"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-800 dark:text-red-200 flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: Messages lists */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-[600px]">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar correos (ej. paciente, receta)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium">Buscando correos...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 space-y-2">
                <p className="font-medium">No se encontraron correos en tu bandeja.</p>
                <p className="text-[10px]">Prueba con un término de búsqueda diferente.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 ${
                    selectedMessage?.id === msg.id
                      ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/10'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {msg.from.split(' <')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                      {msg.date}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {msg.subject}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">
                    {msg.snippet}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right pane: Message details or Composing */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs h-[600px] flex flex-col relative overflow-hidden">
          {isComposing ? (
            <form onSubmit={handleSendEmail} className="flex flex-col h-full space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Redactar Correo Nuevo</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase text-[10px]">Para (Email del Paciente)</label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@paciente.com"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase text-[10px]">Asunto</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Receta Oftalmológica - Ópticas San Antonio"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1 flex flex-col h-[320px]">
                  <label className="block font-bold text-slate-400 uppercase text-[10px]">Cuerpo del Mensaje</label>
                  <textarea
                    required
                    placeholder="Escribe el contenido del correo aquí..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition-colors font-medium resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{sending ? 'Enviando...' : 'Enviar Correo con Gmail'}</span>
              </button>
            </form>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{selectedMessage.subject}</h3>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">De: {selectedMessage.from}</p>
                </div>
                <span className="ml-auto text-[10px] text-slate-400 font-mono shrink-0">{selectedMessage.date}</span>
              </div>

              <div className="flex-1 overflow-y-auto py-5 pr-1 text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-xs space-y-4 whitespace-pre-wrap">
                {selectedMessage.body}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => {
                    setToEmail(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                    setSubject(`Re: ${selectedMessage.subject}`);
                    setEmailBody(`\n\n--- El ${selectedMessage.date}, escribió ---\n> ${selectedMessage.body.slice(0, 200)}...`);
                    setIsComposing(true);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Responder Correo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400 dark:text-slate-500">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">Ningún Correo Seleccionado</p>
                <p className="text-[10px] max-w-xs">Selecciona un mensaje de la bandeja de entrada para leer su contenido completo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
