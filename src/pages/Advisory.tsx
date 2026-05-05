import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Calendar, Leaf, Mic, Send, Sprout, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import MobileLayout from '../components/layout/MobileLayout';
import Button from '../components/ui/Button';
import { streamChat, analyzeCropImage } from '../services/geminiService';
import { useAuthStore } from '../store/authStore';
import Markdown from '../utils/markdown';
import type { ChatMessage, Language } from '../types';


interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const LANG_TAG: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
};

export default function Advisory() {
  const { t } = useTranslation();
  const { profile, language } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ctx = {
    name: profile?.name,
    state: profile?.state,
    language,
    crops: profile?.primary_crops,
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);

    setMessages((m) => [...m, { role: 'model', content: '', timestamp: Date.now() }]);
    let buffer = '';
    await streamChat(messages, text, ctx, (chunk) => {
      buffer += chunk;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'model', content: buffer, timestamp: Date.now() };
        return copy;
      });
    });
    setStreaming(false);
  };

  const handleMic = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error('Voice input not supported on this browser');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = LANG_TAG[language] ?? 'en-IN';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const handleImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const userMsg: ChatMessage = {
        role: 'user',
        content: '📷 Sent a leaf photo for disease analysis',
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);
      setStreaming(true);
      const reply = await analyzeCropImage(base64, file.type, ctx);
      setMessages((m) => [...m, { role: 'model', content: reply, timestamp: Date.now() }]);
      setStreaming(false);
    };
    reader.readAsDataURL(file);
  };

  const quick = [
    { key: 'pest', icon: Bug, prompt: 'Give me practical pest control tips for my crops.' },
    {
      key: 'fertilizer',
      icon: Leaf,
      prompt: 'What is the ideal NPK fertilizer ratio for my crops this season?',
    },
    {
      key: 'calendar',
      icon: Calendar,
      prompt: 'Share a month-by-month sowing calendar for my crops in my state.',
    },
    { key: 'disease', icon: Sprout, prompt: 'Help me identify diseases — I will upload a photo.' },
  ] as const;

  return (
    <MobileLayout title={t('advisory.title')}>
      <div className="flex flex-col h-[calc(100vh-4rem-4.5rem)]">
        <div className="px-4 pt-3 grid grid-cols-4 gap-2">
          {quick.map(({ key, icon: Icon, prompt }) => (
            <button
              key={key}
              onClick={() => handleSend(prompt)}
              className="flex flex-col items-center gap-1 bg-primary-pale text-primary-forest rounded-xl py-2 text-[10px] font-medium"
            >
              <Icon size={18} />
              {t(`advisory.quick.${key}`)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-12">
              Namaste {profile?.name || 'Kisan'}! Ask me anything about your farm.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm whitespace-pre-wrap'
                    : 'bg-primary-pale text-primary-forest rounded-bl-sm'
                }`}
              >
                {m.role === 'user' ? (
                  m.content || '...'
                ) : m.content ? (
                  <Markdown text={m.content} />
                ) : (
                  '...'
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-100 p-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImage(f);
                e.target.value = '';
              }}
            />
            <button
              className="p-2 rounded-full bg-primary-pale text-primary-forest"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload image"
            >
              <Upload size={18} />
            </button>
            <button
              className={`p-2 rounded-full ${
                listening ? 'bg-alert text-white animate-pulse' : 'bg-primary-pale text-primary-forest'
              }`}
              onClick={handleMic}
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('advisory.placeholder')}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <Button
              onClick={() => handleSend()}
              disabled={streaming || !input.trim()}
              icon={<Send size={16} />}
              className="!px-4 !py-2.5 !min-h-0"
            >
              {t('advisory.send')}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
