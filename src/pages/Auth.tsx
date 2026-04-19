import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Step = "phone" | "code" | "name";

const COUNTRY_CODE = "+7";

interface AuthProps {
  onAuth: () => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "phone") phoneRef.current?.focus();
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 300);
      setCountdown(60);
    }
  }, [step]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    let result = digits;
    if (digits.length > 0) result = "(" + digits.slice(0, 3);
    if (digits.length >= 3) result += ") " + digits.slice(3, 6);
    if (digits.length >= 6) result += "-" + digits.slice(6, 8);
    if (digits.length >= 8) result += "-" + digits.slice(8, 10);
    return result;
  };

  const handlePhoneSubmit = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("code"); }, 800);
  };

  const handleCodeChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 4) codeRefs.current[idx + 1]?.focus();
    if (next.every(c => c !== "") && next.join("").length === 5) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Demo: code 12345 = existing user, else register
        if (next.join("") === "12345") onAuth();
        else setStep("name");
      }, 700);
    }
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus();
    }
  };

  const handleNameSubmit = () => {
    if (!firstName.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 700);
  };

  const slideClass = "animate-fade-in";

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(220,25%,7%)] font-golos overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, hsla(42,85%,58%,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, hsla(220,80%,50%,0.05) 0%, transparent 70%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(210,20%,80%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,20%,80%) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-[hsl(42,85%,58%)] flex items-center justify-center font-montserrat font-black text-4xl text-[hsl(220,28%,6%)] mb-4" style={{ boxShadow: "0 8px 32px hsla(42,85%,58%,0.4)" }}>
            M
          </div>
          <div className="font-montserrat font-bold text-2xl text-white">MBA Messenger</div>
          <div className="text-sm text-[hsl(215,15%,50%)] mt-1">Корпоративный мессенджер</div>
        </div>

        {/* Card */}
        <div className="bg-[hsl(220,22%,11%)] rounded-3xl border border-[hsl(220,15%,17%)] overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>

          {/* Step: Phone */}
          {step === "phone" && (
            <div className={`p-7 ${slideClass}`}>
              <h2 className="font-montserrat font-bold text-xl text-white mb-1">Ваш номер телефона</h2>
              <p className="text-sm text-[hsl(215,15%,50%)] mb-6">Мы отправим код подтверждения на ваш номер</p>

              <div className={`flex items-center gap-2 bg-[hsl(220,18%,14%)] rounded-2xl px-4 py-3.5 border ${shake ? "border-red-500" : "border-[hsl(220,15%,20%)]"} transition-colors focus-within:border-[hsl(42,85%,58%)]/50`}
                style={{ transition: shake ? "none" : "border-color 0.2s", animation: shake ? "shake 0.4s ease" : "" }}>
                <span className="text-white font-semibold text-sm">{COUNTRY_CODE}</span>
                <div className="w-px h-5 bg-[hsl(220,15%,25%)]" />
                <input
                  ref={phoneRef}
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  onKeyDown={e => e.key === "Enter" && handlePhoneSubmit()}
                  placeholder="(999) 000-00-00"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[hsl(215,15%,35%)]"
                  inputMode="tel"
                />
                {phone && (
                  <button onClick={() => setPhone("")} className="text-[hsl(215,15%,40%)] hover:text-white transition-colors">
                    <Icon name="X" size={15} />
                  </button>
                )}
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] font-montserrat font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 16px hsla(42,85%,58%,0.3)" }}
              >
                {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <>Продолжить <Icon name="ArrowRight" size={16} /></>}
              </button>

              <p className="text-center text-xs text-[hsl(215,15%,40%)] mt-5 leading-relaxed">
                Нажимая «Продолжить», вы соглашаетесь с{" "}
                <span className="text-[hsl(42,85%,58%)] cursor-pointer hover:underline">условиями использования</span>
              </p>
            </div>
          )}

          {/* Step: Code */}
          {step === "code" && (
            <div className={`p-7 ${slideClass}`}>
              <button onClick={() => { setStep("phone"); setCode(["","","","",""]); }} className="flex items-center gap-1.5 text-[hsl(215,15%,50%)] hover:text-white transition-colors text-sm mb-5">
                <Icon name="ArrowLeft" size={15} /> Назад
              </button>
              <h2 className="font-montserrat font-bold text-xl text-white mb-1">Код подтверждения</h2>
              <p className="text-sm text-[hsl(215,15%,50%)] mb-1">Мы отправили код на номер</p>
              <p className="text-sm text-white font-semibold mb-6">{COUNTRY_CODE} {phone}</p>

              <div className="flex gap-2.5 justify-center mb-6">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { codeRefs.current[idx] = el; }}
                    value={digit}
                    onChange={e => handleCodeChange(idx, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(idx, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className={`w-12 h-14 rounded-2xl text-center text-xl font-bold text-white bg-[hsl(220,18%,14%)] border outline-none transition-all ${digit ? "border-[hsl(42,85%,58%)]" : "border-[hsl(220,15%,20%)] focus:border-[hsl(42,85%,58%)]/50"}`}
                  />
                ))}
              </div>

              {loading && (
                <div className="flex justify-center mb-4">
                  <Icon name="Loader2" size={22} className="animate-spin text-[hsl(42,85%,58%)]" />
                </div>
              )}

              <div className="text-center text-sm text-[hsl(215,15%,50%)]">
                {countdown > 0 ? (
                  <span>Повторный код через <span className="text-[hsl(42,85%,58%)] font-semibold">{countdown} с</span></span>
                ) : (
                  <button onClick={() => { setCode(["","","","",""]); setCountdown(60); }} className="text-[hsl(42,85%,58%)] hover:underline font-medium">
                    Отправить код повторно
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-[hsl(215,15%,35%)] mt-4">Введите демо-код <span className="text-white font-mono">1 2 3 4 5</span> для входа</p>
            </div>
          )}

          {/* Step: Name (new user) */}
          {step === "name" && (
            <div className={`p-7 ${slideClass}`}>
              <h2 className="font-montserrat font-bold text-xl text-white mb-1">Ваше имя</h2>
              <p className="text-sm text-[hsl(215,15%,50%)] mb-6">Как к вам обращаться в мессенджере?</p>

              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[hsl(220,18%,16%)] border-2 border-dashed border-[hsl(220,15%,25%)] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(42,85%,58%)]/40 transition-colors">
                  <Icon name="Camera" size={22} className="text-[hsl(215,15%,40%)]" />
                  <span className="text-[10px] text-[hsl(215,15%,40%)] mt-1">Фото</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  autoFocus
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNameSubmit()}
                  placeholder="Имя"
                  className={`w-full bg-[hsl(220,18%,14%)] rounded-2xl px-4 py-3.5 text-sm text-white outline-none border ${shake && !firstName ? "border-red-500" : "border-[hsl(220,15%,20%)]"} focus:border-[hsl(42,85%,58%)]/50 transition-colors placeholder:text-[hsl(215,15%,35%)]`}
                />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNameSubmit()}
                  placeholder="Фамилия (необязательно)"
                  className="w-full bg-[hsl(220,18%,14%)] rounded-2xl px-4 py-3.5 text-sm text-white outline-none border border-[hsl(220,15%,20%)] focus:border-[hsl(42,85%,58%)]/50 transition-colors placeholder:text-[hsl(215,15%,35%)]"
                />
              </div>

              <button
                onClick={handleNameSubmit}
                disabled={loading}
                className="w-full mt-5 py-3.5 rounded-2xl bg-[hsl(42,85%,58%)] text-[hsl(220,28%,6%)] font-montserrat font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 16px hsla(42,85%,58%,0.3)" }}
              >
                {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <>Начать <Icon name="ArrowRight" size={16} /></>}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[hsl(215,15%,30%)] mt-6">MBA Messenger © 2026</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
