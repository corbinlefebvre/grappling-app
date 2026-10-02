'use client';

import React from 'react';
import { Menu, X, GitBranch, Sparkles, BookOpen, Clock, Users, Volume2, LogOut, LogIn, Calendar as CalendarIcon, Music, Edit3 } from 'lucide-react';
import { Instructor } from '../types';

interface NavigationProps {
  academyName: string;
  activeTab: 'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile';
  setActiveTab: (tab: 'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  isMusicDeckOpen: boolean;
  setIsMusicDeckOpen: (val: boolean) => void;
  isMusicPlaying: boolean;
  setIsAudioModalOpen: (val: boolean) => void;
  currentInstructor: Instructor | null;
  setCurrentInstructor: (instructor: Instructor | null) => void;
  setIsLoginModalOpen: (val: boolean) => void;
  setLoginError: (val: string) => void;
}

export function Navigation(props: NavigationProps) {
  const {
    academyName, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen,
    isMusicDeckOpen, setIsMusicDeckOpen, isMusicPlaying, setIsAudioModalOpen,
    currentInstructor, setCurrentInstructor, setIsLoginModalOpen, setLoginError
  } = props;

  return (
    <nav className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-sm tracking-wider">
            SubCadence
          </div>
          <span className="font-bold text-sm sm:text-base hidden sm:inline text-slate-200 truncate max-w-[180px] md:max-w-xs">{academyName}</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('mat')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'mat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Mat Timer</button>
          <button onClick={() => setActiveTab('builder')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'builder' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Lesson Builder</button>
          <button onClick={() => setActiveTab('community')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'community' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Curriculum Hub</button>
          <button onClick={() => setActiveTab('flows')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition ${activeTab === 'flows' ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:text-cyan-300'}`}><GitBranch size={14} />Flow Chains</button>
          <button onClick={() => setActiveTab('calendar')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Academy Calendar</button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-indigo-300'}`}><Sparkles size={14} />Ask AI</button>
          <button onClick={() => setActiveTab('academy')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'academy' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Roster & Roles</button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsMusicDeckOpen(!isMusicDeckOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isMusicDeckOpen || isMusicPlaying
                ? 'bg-purple-950/60 border-purple-600 text-purple-300 shadow-md'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Music size={15} className={isMusicPlaying ? 'animate-pulse text-purple-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Music</span>
          </button>

          <button
            onClick={() => setIsAudioModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold hover:border-slate-700"
          >
            <Volume2 size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Bells</span>
          </button>

          {currentInstructor ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 text-left hover:opacity-80 transition bg-slate-900/60 border border-slate-800 px-2 py-1 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  {currentInstructor.name[0]}
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-bold text-slate-100">{currentInstructor.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-400">{currentInstructor.role}</div>
                </div>
              </button>

              <button
                onClick={() => setCurrentInstructor(null)}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setLoginError(''); setIsLoginModalOpen(true); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 rounded-xl shadow-md transition"
            >
              <LogIn size={14} /> Log In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 pb-1">
          <button onClick={() => { setActiveTab('mat'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'mat' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-300'}`}>
            <Clock size={14} /> Mat Timer
          </button>
          <button onClick={() => { setActiveTab('builder'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'builder' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-300'}`}>
            <Edit3 size={14} /> Lesson Builder
          </button>
          <button onClick={() => { setActiveTab('community'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'community' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-300'}`}>
            <BookOpen size={14} /> Curriculum Hub
          </button>
          <button onClick={() => { setActiveTab('flows'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'flows' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-cyan-400'}`}>
            <GitBranch size={14} /> Flow Chains
          </button>
          <button onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-300'}`}>
            <CalendarIcon size={14} /> Calendar
          </button>
          <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-indigo-400'}`}>
            <Sparkles size={14} /> Ask AI
          </button>
          <button onClick={() => { setActiveTab('academy'); setIsMobileMenuOpen(false); }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 col-span-2 ${activeTab === 'academy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-300'}`}>
            <Users size={14} /> Roster & Roles
          </button>
        </div>
      )}
    </nav>
  );
}