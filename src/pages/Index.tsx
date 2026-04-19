import { useState } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Алексей Петров", role: "Директор по продажам", avatar: "АП", online: true },
  { id: 2, name: "Мария Козлова", role: "HR-менеджер", avatar: "МК", online: true },
  { id: 3, name: "Дмитрий Смирнов", role: "Разработчик", avatar: "ДС", online: false },
  { id: 4, name: "Екатерина Иванова", role: "Финансовый аналитик", avatar: "ЕИ", online: false },
  { id: 5, name: "Олег Федоров", role: "Руководитель проекта", avatar: "ОФ", online: true },
  { id: 6, name: "Наталья Белова", role: "Маркетолог", avatar: "НБ", online: false },
];

const CHATS = [
  { id: 1, name: "Алексей Петров", avatar: "АП", online: true, lastMsg: "Договорились на среду, всё ок", time: "14:45", unread: 2, messages: [
    { id: 1, text: "Привет! Как дела с квартальным отчётом?", out: false, time: "14:10" },
    { id: 2, text: "Всё идёт по плану, сегодня закончу", out: true, time: "14:12" },
    { id: 3, text: "Отлично! Встречаемся в среду на планёрке?", out: false, time: "14:40" },
    { id: 4, text: "Договорились на среду, всё ок", out: false, time: "14:45" },
  ]},
  { id: 2, name: "Общий отдел", avatar: "ОО", online: false, isGroup: true, lastMsg: "Мария: Коллеги, напоминаю про митинг", time: "13:20", unread: 5, messages: [
    { id: 1, text: "Коллеги, напоминаю про митинг в 15:00", out: false, sender: "Мария К.", time: "13:20" },
    { id: 2, text: "Буду!", out: true, time: "13:25" },
    { id: 3, text: "Я тоже подключусь", out: false, sender: "Дмитрий С.", time: "13:28" },
  ]},
  { id: 3, name: "Мария Козлова", avatar: "МК", online: true, lastMsg: "Документы отправила на почту", time: "11:05", unread: 0, messages: [
    { id: 1, text: "Документы отправила на почту", out: false, time: "11:05" },
  ]},
  { id: 4, name: "Команда разработки", avatar: "КР", online: false, isGroup: true, lastMsg: "Дмитрий: Deploy прошёл успешно", time: "Вчера", unread: 0, messages: [
    { id: 1, text: "Deploy прошёл успешно 🚀", out: false, sender: "Дмитрий С.", time: "Вчера" },
  ]},
  { id: 5, name: "Олег Федоров", avatar: "ОФ", online: true, lastMsg: "Проект сдаём в пятницу", time: "Вчера", unread: 1, messages: [
    { id: 1, text: "Проект сдаём в пятницу", out: false, time: "Вчера" },
  ]},
];

const CHANNELS = [
  { id: 1, name: "Объявления компании", avatar: "📢", subscribers: 148, lastMsg: "Корпоратив 15 мая в 18:00 в ресторане...", time: "10:00", unread: 1 },
  { id: 2, name: "IT и технологии", avatar: "💻", subscribers: 42, lastMsg: "Новый инструмент для управления задачами", time: "Вчера", unread: 3 },
  { id: 3, name: "HR и кадры", avatar: "👥", subscribers: 89, lastMsg: "Открыта вакансия: Senior Product Manager", time: "Вчера", unread: 0 },
  { id: 4, name: "Финансовые новости", avatar: "📊", subscribers: 67, lastMsg: "Итоги Q1 2026 — рост выручки на 24%", time: "Пн", unread: 2 },
  { id: 5, name: "Маркетинг и продажи", avatar: "🎯", subscribers: 55, lastMsg: "Презентация новой стратегии готова", time: "Пн", unread: 0 },
];

type Section = "chats" | "contacts" | "channels" | "profile" | "search";

interface Message { id: number; text: string; out: boolean; time: string; sender?: string; }
interface Chat { id: number; name: string; avatar: string; online: boolean; lastMsg: string; time: string; unread: number; messages: Message[]; isGroup?: boolean; }

function Avatar({ initials, size = "md", online }: { initials: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-20 h-20 text-2xl" };
  const isEmoji = initials.length <= 2 && initials.charCodeAt(0) > 127;
  return (
    <div className={`relative flex-shrink-0 ${sizes[size]} rounded-full flex items-center justify-center font-semibold ${isEmoji ? "bg-[hsl(220,22%,14%)] text-xl" : "bg-gradient-to-br from-[hsl(42,85%,58%)] to-[hsl(42,60%,40%)] text-[hsl(220,28%,6%)]"}`}>
      {initials}
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[hsl(142,70%,45%)] rounded-full border-2 border-[hsl(220,28%,6%)]" />}
    </div>
  );
}

function ChatArea({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>(chat.messages);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: msg, out: true, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(220,15%,18%)] bg-[hsl(220,22%,11%)]">
        <button onClick={onBack} className="md:hidden p-1.5 rounded-lg hover:bg-[hsl(220,18%,14%)] transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <Avatar initials={chat.avatar} size="md" online={chat.online} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{chat.name}</div>
          <div className="text-xs text-[hsl(215,15%,50%)]">
            {chat.online ? <span className="text-[hsl(142,70%,45%)]">онлайн</span> : "не в сети"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[{ icon: "Phone" }, { icon: "Video" }, { icon: "Search" }].map(b => (
            <button key={b.icon} className="p-2 rounded-lg hover:bg-[hsl(220,18%,14%)] transition-colors text-[hsl(215,15%,50%)] hover:text-[hsl(42,85%,58%)]">
              <Icon name={b.icon} size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: "hsl(220,25%,7%)", backgroundImage: "radial-gradient(circle at 20% 80%, hsla(42,85%,58%,0.03) 0%, transparent 50%)" }}>
        {messages.map((m, i) => (
          <div key={m.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
            {!m.out && m.sender && <div className="text-xs text-[hsl(42,85%,58%)] font-medium ml-2 mb-1">{m.sender}</div>}
            <div className={`flex ${m.out ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${m.out ? "bg-[hsl(220,45%,22%)] rounded-br-sm" : "bg-[hsl(220,22%,11%)] rounded-bl-sm"}`}>
                {m.text}
                <div className="text-[10px] mt-1 text-[hsl(215,15%,50%)] flex items-center gap-1 justify-end">
                  {m.time}
                  {m.out && <Icon name="CheckCheck" size={12} className="text-[hsl(42,85%,58%)]" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-[hsl(220,15%,18%)] bg-[hsl(220,22%,11%)]">
        <div className="flex items-center gap-2 bg-[hsl(220,18%,14%)] rounded-2xl px-4 py-2">
          <button className="text-[hsl(215,15%,50%)] hover:text-[hsl(42,85%,58%)] transition-colors"><Icon name="Paperclip" size={18} /></button>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Написать сообщение..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(215,15%,50%)]" />
          <button className="text-[hsl(215,15%,50%)] hover:text-[hsl(42,85%,58%)] transition-colors"><Icon name="Smile" size={18} /></button>
          <button onClick={send} className="ml-1 w-8 h-8 rounded-full bg-[hsl(42,85%,58%)] flex items-center justify-center text-[hsl(220,28%,6%)] hover:opacity-90 transition-opacity">
            <Icon name="Send" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems: { key: Section; icon: string; label: string }[] = [
    { key: "chats", icon: "MessageCircle", label: "Чаты" },
    { key: "contacts", icon: "Users", label: "Контакты" },
    { key: "channels", icon: "Radio", label: "Каналы" },
    { key: "search", icon: "Search", label: "Поиск" },
    { key: "profile", icon: "User", label: "Профиль" },
  ];

  const totalUnread = CHATS.reduce((acc, c) => acc + c.unread, 0);

  type SearchItem = { id: number; name: string; avatar: string; type: string; online?: boolean; };
  const allItems: SearchItem[] = [
    ...CHATS.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, type: "Чат", online: c.online })),
    ...CONTACTS.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, type: "Контакт", online: c.online })),
    ...CHANNELS.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, type: "Канал", online: false })),
  ];
  const filtered = allItems.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[hsl(220,25%,8%)] font-golos">
      {/* Sidebar */}
      <aside className={`flex flex-col ${activeChat ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 bg-[hsl(220,28%,6%)] border-r border-[hsl(220,15%,14%)] flex-shrink-0`}>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-[hsl(220,15%,14%)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(42,85%,58%)] flex items-center justify-center text-[hsl(220,28%,6%)] font-montserrat font-black text-base shadow-lg" style={{ boxShadow: "0 4px 14px hsla(42,85%,58%,0.35)" }}>M</div>
            <div>
              <div className="font-montserrat font-bold text-sm text-white leading-none">MBA Messenger</div>
              <div className="text-[10px] text-[hsl(215,15%,50%)] mt-0.5">Корпоративный мессенджер</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex border-b border-[hsl(220,15%,14%)]">
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setSection(item.key); setActiveChat(null); }}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[9px] font-semibold tracking-wide transition-colors relative ${section === item.key ? "text-[hsl(42,85%,58%)]" : "text-[hsl(215,15%,50%)] hover:text-[hsl(210,20%,80%)]"}`}>
              <div className="relative">
                <Icon name={item.icon} size={17} />
                {item.key === "chats" && totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] rounded-full text-[8px] font-black flex items-center justify-center">{totalUnread}</span>
                )}
              </div>
              {item.label}
              {section === item.key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[hsl(42,85%,58%)] rounded-full" />}
            </button>
          ))}
        </nav>

        {/* List */}
        <div className="flex-1 overflow-y-auto">

          {section === "chats" && (
            <div className="animate-fade-in">
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center gap-2 bg-[hsl(220,22%,11%)] rounded-xl px-3 py-2">
                  <Icon name="Search" size={13} className="text-[hsl(215,15%,50%)]" />
                  <input placeholder="Поиск чатов..." className="bg-transparent text-xs outline-none flex-1 placeholder:text-[hsl(215,15%,50%)]" />
                </div>
              </div>
              {CHATS.map((chat, i) => (
                <button key={chat.id} onClick={() => setActiveChat(chat)}
                  className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${activeChat?.id === chat.id ? "bg-[hsl(220,22%,11%)]" : "hover:bg-[hsl(220,18%,9%)]"}`}
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <Avatar initials={chat.avatar} size="md" online={chat.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
                      <span className="text-[10px] text-[hsl(215,15%,50%)] ml-2 flex-shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-[hsl(215,15%,50%)] truncate">{chat.lastMsg}</span>
                      {chat.unread > 0 && <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] rounded-full text-[10px] font-black flex items-center justify-center">{chat.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {section === "contacts" && (
            <div className="animate-fade-in p-3 space-y-0.5">
              <div className="flex items-center gap-2 bg-[hsl(220,22%,11%)] rounded-xl px-3 py-2 mb-3">
                <Icon name="Search" size={13} className="text-[hsl(215,15%,50%)]" />
                <input placeholder="Найти сотрудника..." className="bg-transparent text-xs outline-none flex-1 placeholder:text-[hsl(215,15%,50%)]" />
              </div>
              <div className="text-[9px] text-[hsl(215,15%,50%)] font-bold tracking-widest px-2 pb-2">СОТРУДНИКИ · {CONTACTS.length}</div>
              {CONTACTS.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[hsl(220,18%,9%)] transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <Avatar initials={c.avatar} size="md" online={c.online} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{c.name}</div>
                    <div className="text-xs text-[hsl(215,15%,50%)]">{c.role}</div>
                  </div>
                  {c.online && <span className="text-[10px] text-[hsl(142,70%,45%)] font-medium">онлайн</span>}
                </div>
              ))}
            </div>
          )}

          {section === "channels" && (
            <div className="animate-fade-in p-3 space-y-0.5">
              <div className="text-[9px] text-[hsl(215,15%,50%)] font-bold tracking-widest px-2 pb-3">КОРПОРАТИВНЫЕ КАНАЛЫ</div>
              {CHANNELS.map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-[hsl(220,18%,9%)] transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="w-10 h-10 rounded-full bg-[hsl(220,22%,11%)] flex items-center justify-center text-xl flex-shrink-0">{ch.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{ch.name}</span>
                      <span className="text-[10px] text-[hsl(215,15%,50%)]">{ch.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-[hsl(215,15%,50%)] truncate">{ch.lastMsg}</span>
                      {ch.unread > 0 && <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] rounded-full text-[10px] font-black flex items-center justify-center">{ch.unread}</span>}
                    </div>
                    <div className="text-[10px] text-[hsl(215,15%,40%)] mt-0.5">{ch.subscribers} подписчиков</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "search" && (
            <div className="animate-fade-in p-3">
              <div className="flex items-center gap-2 bg-[hsl(220,22%,11%)] rounded-xl px-3 py-2.5 mb-3 border border-[hsl(42,85%,58%)]/20">
                <Icon name="Search" size={14} className="text-[hsl(42,85%,58%)]" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по всему..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-[hsl(215,15%,50%)]" />
                {searchQuery && <button onClick={() => setSearchQuery("")}><Icon name="X" size={13} className="text-[hsl(215,15%,50%)]" /></button>}
              </div>
              {searchQuery ? (
                <div className="space-y-0.5 animate-fade-in">
                  <div className="text-[9px] text-[hsl(215,15%,50%)] font-bold tracking-widest px-2 pb-2">РЕЗУЛЬТАТЫ · {filtered.length}</div>
                  {filtered.map((r, i) => (
                    <div key={`${r.type}-${r.id}`} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[hsl(220,18%,9%)] transition-colors cursor-pointer">
                      <Avatar initials={r.avatar || "?"} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white">{r.name}</div>
                        <div className="text-[10px] text-[hsl(42,85%,58%)]">{r.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={32} className="mx-auto mb-3 text-[hsl(215,15%,30%)]" />
                  <div className="text-sm text-[hsl(215,15%,50%)]">Введите запрос для поиска</div>
                  <div className="text-xs text-[hsl(215,15%,35%)] mt-1">по чатам, контактам и каналам</div>
                </div>
              )}
            </div>
          )}

          {section === "profile" && (
            <div className="animate-fade-in p-4">
              <div className="flex flex-col items-center py-6 border-b border-[hsl(220,15%,14%)] mb-4">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(42,85%,58%)] to-[hsl(42,60%,40%)] flex items-center justify-center font-montserrat font-black text-2xl text-[hsl(220,28%,6%)] mb-3" style={{ boxShadow: "0 8px 24px hsla(42,85%,58%,0.3)" }}>
                  ВА
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[hsl(142,70%,45%)] rounded-full border-2 border-[hsl(220,28%,6%)]" />
                </div>
                <div className="font-semibold text-base text-white">Владислав Александров</div>
                <div className="text-xs text-[hsl(42,85%,58%)] mt-0.5 font-medium">CEO · Генеральный директор</div>
                <div className="text-xs text-[hsl(215,15%,50%)] mt-1">@v.alexandrov</div>
              </div>
              <div className="space-y-1">
                {[
                  { icon: "Bell", label: "Уведомления", danger: false },
                  { icon: "Shield", label: "Конфиденциальность", danger: false },
                  { icon: "Palette", label: "Тема оформления", danger: false },
                  { icon: "Smartphone", label: "Связанные устройства", danger: false },
                  { icon: "HelpCircle", label: "Помощь и поддержка", danger: false },
                  { icon: "LogOut", label: "Выйти", danger: true },
                ].map(item => (
                  <button key={item.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${item.danger ? "hover:bg-red-500/10 text-red-400" : "hover:bg-[hsl(220,18%,9%)] text-[hsl(210,20%,80%)]"}`}>
                    <Icon name={item.icon} size={16} className={item.danger ? "" : "text-[hsl(215,15%,50%)]"} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {!item.danger && <Icon name="ChevronRight" size={13} className="ml-auto text-[hsl(215,15%,40%)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"} overflow-hidden`}>
        {activeChat ? (
          <ChatArea chat={activeChat} onBack={() => setActiveChat(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8" style={{ background: "hsl(220,25%,7%)", backgroundImage: "radial-gradient(circle at 50% 40%, hsla(42,85%,58%,0.05) 0%, transparent 55%)" }}>
            <div className="w-20 h-20 rounded-2xl bg-[hsl(220,22%,11%)] flex items-center justify-center mb-5" style={{ boxShadow: "0 0 40px hsla(42,85%,58%,0.12)" }}>
              <div className="font-montserrat font-black text-4xl text-[hsl(42,85%,58%)]">M</div>
            </div>
            <div className="font-montserrat font-bold text-2xl text-white mb-2">MBA Messenger</div>
            <div className="text-sm text-[hsl(215,15%,50%)] max-w-xs leading-relaxed">
              Выберите чат слева, чтобы начать общение, или воспользуйтесь поиском для навигации
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
              {[
                { icon: "MessageCircle", label: "Чатов", value: CHATS.length },
                { icon: "Users", label: "Контактов", value: CONTACTS.length },
                { icon: "Radio", label: "Каналов", value: CHANNELS.length },
              ].map(stat => (
                <div key={stat.label} className="bg-[hsl(220,22%,11%)] rounded-2xl p-4 text-center border border-[hsl(220,15%,16%)]">
                  <Icon name={stat.icon} size={20} className="text-[hsl(42,85%,58%)] mx-auto mb-2" />
                  <div className="font-bold text-xl text-white">{stat.value}</div>
                  <div className="text-[10px] text-[hsl(215,15%,50%)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}