import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const ADMIN_URL = "https://functions.poehali.dev/c9738026-622f-4d24-a3ee-ea36279936ba";
const DEFAULT_KEY = "mba-admin-2026";

interface AuthCode {
  id: number;
  phone: string;
  code: string;
  status: string;
  created_at: string;
  used_at: string | null;
  ip: string | null;
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem("mba_admin_key") || "");
  const [authed, setAuthed] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState("");
  const [items, setItems] = useState<AuthCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(ADMIN_URL, {
        method: "GET",
        headers: { "X-Admin-Key": key }
      });
      if (res.status === 401) {
        setAuthed(false);
        setAdminKey("");
        localStorage.removeItem("mba_admin_key");
        setError("Неверный ключ администратора");
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setAuthed(true);
      localStorage.setItem("mba_admin_key", key);
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) load(adminKey);
  }, [adminKey, load]);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => load(adminKey), 5000);
    return () => clearInterval(t);
  }, [authed, adminKey, load]);

  const handleLogin = () => {
    if (!keyInput.trim()) return;
    setAdminKey(keyInput.trim());
  };

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const logout = () => {
    localStorage.removeItem("mba_admin_key");
    setAdminKey("");
    setAuthed(false);
    setItems([]);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,7%)] font-golos p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(42,85%,58%)] flex items-center justify-center font-montserrat font-black text-3xl text-[hsl(220,28%,6%)] mb-4">M</div>
            <div className="font-montserrat font-bold text-xl text-white">Админ-панель</div>
            <div className="text-sm text-[hsl(215,15%,50%)]">MBA Messenger</div>
          </div>
          <div className="bg-[hsl(220,22%,11%)] rounded-3xl border border-[hsl(220,15%,17%)] p-7">
            <label className="text-xs text-[hsl(215,15%,50%)] font-semibold tracking-wide">КЛЮЧ АДМИНИСТРАТОРА</label>
            <input
              type="password"
              autoFocus
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Введите ключ..."
              className="mt-2 w-full bg-[hsl(220,18%,14%)] rounded-2xl px-4 py-3.5 text-sm text-white outline-none border border-[hsl(220,15%,20%)] focus:border-[hsl(42,85%,58%)]/50 transition-colors"
            />
            <button
              onClick={handleLogin}
              className="w-full mt-4 py-3.5 rounded-2xl bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] font-montserrat font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Войти
            </button>
            {error && <div className="mt-3 text-xs text-red-400 text-center">{error}</div>}
            <div className="mt-5 text-[11px] text-[hsl(215,15%,35%)] text-center leading-relaxed">
              По умолчанию: <span className="text-white font-mono">{DEFAULT_KEY}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pending = items.filter(i => i.status === "pending");
  const used = items.filter(i => i.status === "used");

  return (
    <div className="min-h-screen bg-[hsl(220,25%,7%)] font-golos">
      {/* Header */}
      <div className="bg-[hsl(220,28%,6%)] border-b border-[hsl(220,15%,14%)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(42,85%,58%)] flex items-center justify-center font-montserrat font-black text-base text-[hsl(220,28%,6%)]">M</div>
            <div>
              <div className="font-montserrat font-bold text-sm text-white">Админ-панель</div>
              <div className="text-[10px] text-[hsl(215,15%,50%)]">Запросы кодов авторизации</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(adminKey)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(220,22%,11%)] hover:bg-[hsl(220,18%,14%)] transition-colors text-xs text-white"
            >
              <Icon name={loading ? "Loader2" : "RefreshCw"} size={13} className={loading ? "animate-spin" : ""} />
              Обновить
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-xs"
            >
              <Icon name="LogOut" size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[hsl(220,22%,11%)] rounded-2xl p-4 border border-[hsl(220,15%,16%)]">
            <div className="text-[10px] text-[hsl(215,15%,50%)] font-semibold tracking-wider">ОЖИДАЮТ</div>
            <div className="font-bold text-2xl text-[hsl(42,85%,58%)] mt-1">{pending.length}</div>
          </div>
          <div className="bg-[hsl(220,22%,11%)] rounded-2xl p-4 border border-[hsl(220,15%,16%)]">
            <div className="text-[10px] text-[hsl(215,15%,50%)] font-semibold tracking-wider">ИСПОЛЬЗОВАНО</div>
            <div className="font-bold text-2xl text-[hsl(142,70%,45%)] mt-1">{used.length}</div>
          </div>
          <div className="bg-[hsl(220,22%,11%)] rounded-2xl p-4 border border-[hsl(220,15%,16%)]">
            <div className="text-[10px] text-[hsl(215,15%,50%)] font-semibold tracking-wider">ВСЕГО</div>
            <div className="font-bold text-2xl text-white mt-1">{items.length}</div>
          </div>
        </div>

        {/* Pending */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[hsl(42,85%,58%)] animate-pulse" />
            <h2 className="font-montserrat font-bold text-sm text-white">Активные запросы</h2>
            <span className="text-xs text-[hsl(215,15%,50%)]">· {pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="bg-[hsl(220,22%,11%)] rounded-2xl border border-[hsl(220,15%,16%)] p-10 text-center">
              <Icon name="Inbox" size={28} className="mx-auto mb-2 text-[hsl(215,15%,30%)]" />
              <div className="text-sm text-[hsl(215,15%,50%)]">Ожидающих запросов нет</div>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map(item => (
                <div key={item.id} className="bg-[hsl(220,22%,11%)] rounded-2xl border border-[hsl(42,85%,58%)]/20 p-4 flex items-center gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[hsl(220,18%,14%)] flex items-center justify-center">
                    <Icon name="Phone" size={16} className="text-[hsl(42,85%,58%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{item.phone}</div>
                    <div className="text-[11px] text-[hsl(215,15%,50%)] mt-0.5">
                      {formatTime(item.created_at)}
                      {item.ip && <span className="ml-2">· {item.ip}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => copyCode(item.id, item.code)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] font-montserrat font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    {copied === item.id ? (
                      <>
                        <Icon name="Check" size={14} /> Скопировано
                      </>
                    ) : (
                      <>
                        <span className="font-mono tracking-wider">{item.code}</span>
                        <Icon name="Copy" size={13} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[hsl(142,70%,45%)]" />
            <h2 className="font-montserrat font-bold text-sm text-white">История</h2>
            <span className="text-xs text-[hsl(215,15%,50%)]">· {used.length}</span>
          </div>
          <div className="bg-[hsl(220,22%,11%)] rounded-2xl border border-[hsl(220,15%,16%)] overflow-hidden">
            {used.length === 0 ? (
              <div className="p-8 text-center text-sm text-[hsl(215,15%,50%)]">Истории пока нет</div>
            ) : (
              used.map((item, i) => (
                <div key={item.id} className={`flex items-center gap-4 px-4 py-3 ${i !== used.length - 1 ? "border-b border-[hsl(220,15%,14%)]" : ""}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center">
                    <Icon name="CheckCircle2" size={14} className="text-[hsl(142,70%,45%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white">{item.phone}</div>
                    <div className="text-[11px] text-[hsl(215,15%,50%)]">
                      Код: <span className="font-mono text-[hsl(215,15%,70%)]">{item.code}</span>
                      <span className="ml-2">· {item.used_at ? formatTime(item.used_at) : ""}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center text-xs text-[hsl(215,15%,30%)] mt-8">
          Автообновление каждые 5 секунд
        </div>
      </div>
    </div>
  );
}
