import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Sliders, CalendarRange, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          onClose(); // Triggers parent toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const items = [
    { label: 'Timetable Dashboard', desc: 'View core stats and versions', route: 'dashboard', icon: Sparkles },
    { label: 'Academic Registry', desc: 'Manage teachers, classrooms, rooms', route: 'registry', icon: Users },
    { label: 'Constraints Manager', desc: 'Configure solver parameters & rules', route: 'constraints', icon: Sliders },
    { label: 'Weekly Grid Editor', desc: 'Drag-and-drop slots manually', route: 'scheduler', icon: CalendarRange },
    { label: 'System Settings', desc: 'Institution details and metadata', route: 'settings', icon: Settings },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-sm"
          />

          {/* Spotlight dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl relative overflow-hidden flex flex-col z-10 border border-slate-800"
          >
            {/* Input Wrapper */}
            <div className="relative border-b border-slate-800/80 px-4 py-3 flex items-center">
              <Search className="h-5 w-5 text-slate-500 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search command or jump to screen... (Esc to close)"
                className="w-full bg-transparent text-slate-200 text-xs border-0 outline-none placeholder:text-slate-600 focus:ring-0"
              />
            </div>

            {/* List */}
            <div className="p-2.5 max-h-[300px] overflow-y-auto divide-y divide-slate-900">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(item.route);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-xl flex items-center gap-3.5 hover:bg-slate-800/40 transition-all group"
                    >
                      <div className="h-8.5 w-8.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{item.label}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">No navigation shortcuts match your query.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CommandPalette;
