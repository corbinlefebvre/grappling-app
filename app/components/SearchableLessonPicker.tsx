// app/components/SearchableLessonPicker.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import { LessonPlan } from '../types';

interface SearchableLessonPickerProps {
  lessons: LessonPlan[];
  selectedLessonId: string | null;
  onSelect: (lessonId: string | null) => void;
  placeholder?: string;
}

const PICKER_AGE_GROUPS = ['All Ages', 'Ages 3-6', 'Ages 7-12', 'Adults', 'Masters'];
const PICKER_BELTS = ['All Belts', 'White Belt', 'Blue Belt', 'Purple Belt +'];

export function SearchableLessonPicker({
  lessons,
  selectedLessonId,
  onSelect,
  placeholder = 'Search lessons...',
}: SearchableLessonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [selectedBelt, setSelectedBelt] = useState('All Belts');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  const filtered = lessons.filter((l) => {
    const matchesSearch =
      (l.className || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.concept || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.tags || []).some((t) => (t || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAge = selectedAge === 'All Ages' || l.ageGroup === selectedAge;
    const matchesBelt = selectedBelt === 'All Belts' || (l.beltRank || '').includes(selectedBelt.replace(' +', ''));

    return matchesSearch && matchesAge && matchesBelt;
  });

  const sortedLessons = [...filtered].sort((a, b) => {
    const timeA = (a.createdAt ? new Date(a.createdAt).getTime() : 0) || (Number((a.id || '').match(/(\d{12,14})/)?.[1]) || 0);
    const timeB = (b.createdAt ? new Date(b.createdAt).getTime() : 0) || (Number((b.id || '').match(/(\d{12,14})/)?.[1]) || 0);
    if (timeA !== timeB) return timeB - timeA;
    return (a.className || '').localeCompare(b.className || '');
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAge('All Ages');
    setSelectedBelt('All Belts');
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-left flex items-center justify-between gap-2 hover:border-slate-700 transition"
      >
        <span className={`truncate font-semibold ${selectedLesson ? 'text-emerald-400' : 'text-slate-400'}`}>
          {selectedLesson ? `${selectedLesson.className} (${selectedLesson.concept})` : placeholder}
        </span>
        <ChevronDown size={14} className="text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2.5 space-y-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Filter by title, concept, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Age Group</div>
            <div className="flex flex-wrap gap-1">
              {PICKER_AGE_GROUPS.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    selectedAge === age
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Belt Rank</div>
            <div className="flex flex-wrap gap-1">
              {PICKER_BELTS.map((belt) => (
                <button
                  key={belt}
                  type="button"
                  onClick={() => setSelectedBelt(belt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    selectedBelt === belt
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {belt}
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || selectedAge !== 'All Ages' || selectedBelt !== 'All Belts') && (
            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">{filtered.length} matching plans</span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-amber-400 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-800/40 pt-1">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
                resetFilters();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              (No Lesson Linked)
            </button>

            {sortedLessons.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">No matching lessons found</div>
            ) : (
              sortedLessons.map((l) => {
                const isRecent = ((l.createdAt ? new Date(l.createdAt).getTime() : 0) || (Number((l.id || '').match(/(\d{12,14})/)?.[1]) || 0)) > 0;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onSelect(l.id);
                      setIsOpen(false);
                      resetFilters();
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition flex flex-col ${
                      selectedLessonId === l.id
                        ? 'bg-emerald-950/60 text-emerald-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="truncate">{l.className}</span>
                      {isRecent && <Sparkles size={11} className="text-amber-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-300">{l.concept}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400/90">{l.ageGroup}</span>
                      <span>&bull;</span>
                      <span className="text-indigo-400/90">{l.beltRank}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}