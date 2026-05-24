"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Sprout, 
  ShieldCheck, 
  Smartphone, 
  Target, 
  MapPin, 
  Coffee, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  User,
  Compass,
  Menu,
  X,
  Brain,
  Users,
  Smile,
  Frown,
  Meh,
  Wind,
  Download,
  Settings,
  ScanQrCode,
  SlidersHorizontal,
  Lightbulb,
  Home,
  Star,
  Sparkles,
  Send,
  Moon,
  Headphones,
  BookOpen,
  Lock,
  Calendar,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom smooth scroll animation functions for robust cross-browser support
const scrollToTopSmooth = (e?: React.MouseEvent) => {
  if (e) e.preventDefault();
  const startPosition = window.scrollY;
  const distance = -startPosition;
  const duration = 800; // ms
  let startTime: number | null = null;

  const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, 0);
    }
  };

  requestAnimationFrame(animation);
};

const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    const offset = 90; // offset for the sticky navbar
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const targetPosition = elementPosition - offset;
    
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800; // ms
    let startTime: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
      }
    };

    requestAnimationFrame(animation);
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
      <div className="frosted-glass shadow-sanctuary rounded-full px-8 py-3 flex justify-between items-center h-16">
        <a 
          href="#" 
          onClick={scrollToTopSmooth}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/bondy-heart-icon.png" alt="Bondy Logo" className="h-9 w-9 object-contain rounded-full bg-white p-0.5 border border-brand-outline-variant/30 shadow-sm" />
          <span className="font-display font-bold text-2xl text-brand-primary">Bondy</span>
        </a>

        <div className="hidden lg:flex items-center gap-6 text-brand-on-surface/60 font-medium">
          <a href="#features" onClick={(e) => handleLinkClick(e, 'features')} className="hover:text-brand-primary transition-colors">Tính năng</a>
          <a href="#healing" onClick={(e) => handleLinkClick(e, 'healing')} className="hover:text-brand-primary transition-colors">Healing</a>
          <a href="#coach" onClick={(e) => handleLinkClick(e, 'coach')} className="hover:text-brand-primary transition-colors">AI Coach</a>
          <a href="#explore" onClick={(e) => handleLinkClick(e, 'explore')} className="hover:text-brand-primary transition-colors">Khám phá</a>
          <a href="#security" onClick={(e) => handleLinkClick(e, 'security')} className="hover:text-brand-primary transition-colors">An toàn</a>
          <a href="#faq" onClick={(e) => handleLinkClick(e, 'faq')} className="hover:text-brand-primary transition-colors">FAQ</a>
        </div>

        <a href="#download" onClick={(e) => handleLinkClick(e, 'download')} className="hidden lg:block accent-gradient text-white font-bold py-2.5 px-6 rounded-full hover:shadow-lg transition-all text-center">
          Tải APK
        </a>

        <button className="lg:hidden text-brand-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-4 frosted-glass rounded-3xl p-6 shadow-xl flex flex-col gap-4 text-center"
          >
            <a href="#features" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'features'); }}>Tính năng</a>
            <a href="#healing" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'healing'); }}>Healing</a>
            <a href="#coach" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'coach'); }}>AI Coach</a>
            <a href="#explore" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'explore'); }}>Khám phá</a>
            <a href="#security" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'security'); }}>An toàn</a>
            <a href="#faq" className="text-xl font-medium" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'faq'); }}>FAQ</a>
            <a href="#download" className="accent-gradient text-white font-bold py-4 rounded-full mt-2 text-center" onClick={(e) => { setIsOpen(false); handleLinkClick(e, 'download'); }}>
              Tải APK
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const Hero = () => {
  const [mockupTab, setMockupTab] = useState<'home' | 'explore' | 'healing' | 'chat' | 'profile'>('home');
  const [profileIndex, setProfileIndex] = useState(0);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [repliedMessage, setRepliedMessage] = useState<string | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [healingStage, setHealingStage] = useState<'select' | 'breathing'>('select');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Chào bạn! Hôm nay tâm trạng của bạn thế nào? Cần mình gợi ý câu mở lời không?' }
  ]);

  const profiles = [
    {
      name: "Minh",
      age: 26,
      job: "Designer • Freelance",
      image: "/minh-portrait.png",
      badge1: "🧘‍♀️ Recovering from burnout",
      badge2: "5km away",
      icebreaker: "Hôm nay của bạn thế nào? ✨",
    },
    {
      name: "Phương Linh",
      age: 24,
      job: "Writer • Freelance",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      badge1: "🎨 Creative writer",
      badge2: "3km away",
      icebreaker: "Cuốn sách nào làm bạn khóc gần nhất? 📖",
    }
  ];

  const handleNextProfile = () => {
    setProfileIndex((prev) => (prev + 1) % profiles.length);
    setShowReplyInput(false);
    setRepliedMessage(null);
  };

  const handleLike = () => {
    setShowMatchOverlay(true);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setRepliedMessage(replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setHealingStage('breathing');
  };

  const handleSendChatOption = (text: string) => {
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text },
      { sender: 'ai', text: 'Tuyệt vời! Gợi ý mở đầu: "Chào bạn, mình thấy bạn cũng quan tâm đến chủ đề này, chúng ta chia sẻ thêm nhé!"' }
    ]);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full frosted-glass border border-brand-outline-variant/30 text-brand-primary font-medium text-sm mb-6 shadow-sm">
            <img src="/bondy-heart-icon.png" alt="Bondy Logo" className="h-5 w-5 rounded-full object-cover border border-white" />
            <span>Bondy – Find Your Lifelong Partner</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-[-2px]">
            Bondy – Kết nối thật, <br />
            <span className="text-brand-primary">cảm xúc thật</span>
          </h1>
          <p className="text-xl text-brand-on-surface-variant max-w-lg mb-10 leading-relaxed">
            Ứng dụng hẹn hò giúp bạn tìm kiếm kết nối ý nghĩa, trò chuyện tự nhiên hơn và chăm sóc cảm xúc của mình mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#download" onClick={(e) => handleLinkClick(e, 'download')} className="accent-gradient text-white font-bold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer">
              <Download size={20} />
              Tải APK cho Android
            </a>
            <a href="#features" onClick={(e) => handleLinkClick(e, 'features')} className="bg-brand-surface-container text-brand-primary font-bold py-4 px-8 rounded-full hover:bg-brand-surface-container-high transition-colors cursor-pointer flex items-center justify-center">
              Xem tính năng nổi bật
            </a>
          </div>
        </motion.div>

        <div className="relative flex justify-center items-center h-[600px]">
          {/* Decorative Background glow */}
          <div className="absolute inset-0 bg-brand-primary/10 blur-[100px] rounded-full"></div>
          
          {/* Mockup Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-[320px] h-[640px] rounded-[3rem] border-8 border-brand-outline-variant bg-[#FFFBF9] shadow-2xl overflow-hidden z-20 flex flex-col pt-3 pb-0"
          >
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-600/80"></div>
              <div className="w-8 h-1 bg-neutral-700 rounded-full"></div>
            </div>

            {/* Simulated Status Bar */}
            <div className="h-7 px-6 flex justify-between items-center text-[10px] font-semibold text-brand-on-surface/85 z-30 select-none pt-2">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]">📶</span>
                <span className="text-[9px]">🛜</span>
                <span className="text-[9px]">🔋 94%</span>
              </div>
            </div>

            {/* Simulated Live App Screen Content */}
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden bg-[#FFFBF9]">
              
              {/* Match Overlay */}
              {showMatchOverlay && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center text-white">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2 relative w-12 h-12">
                      <Heart className="text-brand-primary fill-brand-primary animate-ping absolute w-8 h-8" />
                      <Heart className="text-brand-primary fill-brand-primary w-8 h-8 z-10" />
                    </div>
                    <h3 className="text-2xl font-bold font-display">It&apos;s a Match!</h3>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Bạn và {profiles[profileIndex].name} đã kết nối! Trò chuyện ngay với gợi ý thấu cảm từ AI Coach nhé.
                    </p>
                    <div className="flex gap-2 w-full mt-4">
                      <button 
                        onClick={() => {
                          setShowMatchOverlay(false);
                          setMockupTab('chat');
                        }}
                        className="flex-1 accent-gradient text-white text-xs font-bold py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        Trò chuyện ngay
                      </button>
                      <button 
                        onClick={() => setShowMatchOverlay(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-full active:scale-95 transition-all cursor-pointer"
                      >
                        Để sau
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* TAB 1: HOME */}
              {mockupTab === 'home' && (
                <div className="flex-1 flex flex-col justify-between p-2 pt-0 relative overflow-hidden">
                  
                  {/* Top Navigation Bar of Phone Mockup */}
                  <div className="flex justify-between items-center px-2 py-1 z-20 relative">
                    <div className="flex items-center gap-2">
                      <img src="/bondy-heart-icon.png" alt="Bondy Logo" className="h-6 w-6 object-contain" />
                      <span className="font-display font-bold text-lg text-brand-on-surface tracking-tight">Bondy</span>
                    </div>
                    
                    {/* Sliders / Filter trigger on mockup */}
                    <button className="w-8 h-8 rounded-full bg-white border border-brand-outline hover:bg-neutral-50 flex items-center justify-center text-brand-on-surface shadow-xs transition-colors cursor-pointer">
                      <SlidersHorizontal size={13} className="stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Mindful Mode Pill Banner */}
                  <div className="mx-2 my-0.5 p-2 bg-[#FFF3EA] rounded-full flex items-center gap-2 border border-brand-primary/10 z-20 relative shadow-xs">
                    <span className="text-[9px] font-bold tracking-wider text-brand-primary whitespace-nowrap uppercase">MINDFUL MODE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 block"></span>
                    <span className="text-[9px] text-[#A26D53] font-medium truncate">Take it slow ❤️ Không cần vội vã</span>
                  </div>

                  {/* Profile Card Container (High quality photo of Minh, 26) */}
                  <div className="relative flex-1 mx-2 my-1.5 rounded-[2rem] overflow-hidden shadow-md border-2 border-brand-outline bg-neutral-100 flex flex-col justify-end z-10">
                    <img 
                      src={profiles[profileIndex].image} 
                      alt={profiles[profileIndex].name} 
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Visual gradient overlay matching mockup */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                    {/* Icebreaker Card Overlay */}
                    <div 
                      onClick={() => setShowReplyInput(true)}
                      className="absolute top-4 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-brand-outline/40 z-20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-brand-primary text-[9px] font-bold uppercase tracking-wider mb-1">
                        <Lightbulb size={10} className="fill-brand-primary/20" />
                        <span>ICEBREAKER</span>
                      </div>
                      <p className="text-brand-on-surface font-bold text-[11px] leading-snug text-left">
                        {"\"" + profiles[profileIndex].icebreaker + "\""}
                      </p>
                      <p className="text-right text-[8px] text-neutral-400 font-medium italic mt-0.5">
                        Tap to reply
                      </p>
                    </div>

                    {/* Reply Input Overlay inside the card */}
                    {showReplyInput && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex flex-col justify-end p-4">
                        <form onSubmit={handleSendReply} className="bg-white rounded-2xl p-3 shadow-xl">
                          <p className="text-xs text-neutral-500 mb-2 text-left font-medium">Trả lời tin nhắn phá băng:</p>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={replyText} 
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập tin nhắn..." 
                              className="flex-1 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                              autoFocus 
                            />
                            <button type="submit" className="accent-gradient text-white p-2 rounded-xl flex items-center justify-center cursor-pointer">
                              <Send size={12} />
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Replied Message Overlay */}
                    {repliedMessage && (
                      <div className="absolute top-24 right-3 bg-brand-primary text-white rounded-2xl rounded-tr-none px-3 py-2 shadow-lg text-[10.5px] max-w-[80%] z-20 text-left">
                        {repliedMessage}
                      </div>
                    )}

                    {/* Profile Information Overlay containing Name & Badges */}
                    <div className="p-4 relative z-10 text-left flex flex-col gap-2">
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <span className="bg-[#FFEFE9] text-[#DF5C33] text-[9px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-[#FCDCCE]">
                          {profiles[profileIndex].badge1}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                          <MapPin size={8.5} className="text-white fill-white/10" /> {profiles[profileIndex].badge2}
                        </span>
                      </div>

                      {/* Name and Job details */}
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="font-display font-bold text-2xl text-white tracking-wide leading-none flex items-center gap-1">
                            {profiles[profileIndex].name}, {profiles[profileIndex].age}
                          </h4>
                          <p className="text-[10px] text-white/80 font-medium tracking-wide mt-1">
                            {profiles[profileIndex].job}
                          </p>
                        </div>

                        {/* Circular Swipe Down Detailing Button */}
                        <button 
                          onClick={handleNextProfile}
                          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs hover:bg-black/60 text-white flex items-center justify-center border border-white/20 shadow-sm transition-colors active:scale-90 cursor-pointer"
                        >
                          <ArrowDown size={14} className="animate-bounce" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Swipe/Dislike/Like */}
                  <div className="flex justify-center items-center gap-4 py-1 z-20 relative">
                    {/* Dislike (X) */}
                    <button 
                      onClick={handleNextProfile}
                      className="w-11 h-11 rounded-full bg-white border border-brand-outline shadow-md hover:bg-neutral-50 flex items-center justify-center text-red-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <X size={20} className="stroke-[2.5]" />
                    </button>
                    {/* Super Like (Star) */}
                    <button 
                      onClick={handleLike}
                      className="w-9 h-9 rounded-full bg-white border border-brand-outline shadow-sm hover:bg-neutral-50 flex items-center justify-center text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Star size={16} className="fill-amber-500/20" />
                    </button>
                    {/* Like/Wave */}
                    <button 
                      onClick={handleLike}
                      className="w-13 h-13 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
                    >
                      <Sparkles size={24} className="animate-pulse" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPLORE */}
              {mockupTab === 'explore' && (
                <div className="flex-1 flex flex-col justify-between p-3 pt-0 relative overflow-y-auto">
                  <div className="flex justify-between items-center px-1 py-1 mb-2 z-20 relative text-left">
                    <h3 className="font-display font-bold text-lg text-brand-on-surface">Khám phá</h3>
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full">Gần bạn</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 flex-1 pb-4">
                    {[
                      { name: "Khánh Huyền", age: 23, match: "94%", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", tag: "🧘‍♀️ Yoga" },
                      { name: "Nam Khánh", age: 27, match: "89%", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", tag: "☕ Cà phê sách" },
                      { name: "Minh Trang", age: 25, match: "92%", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", tag: "🎨 Hội họa" },
                      { name: "Quốc Anh", age: 29, match: "87%", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", tag: "✈️ Du lịch" }
                    ].map((item, i) => (
                      <div key={i} className="relative rounded-2xl overflow-hidden h-32 shadow-xs border border-brand-outline bg-neutral-100 flex flex-col justify-end p-2 text-left group hover:scale-[1.02] transition-transform duration-300">
                        <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="relative z-10 text-white">
                          <span className="absolute top-[-75px] right-0 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{item.match} match</span>
                          <h5 className="font-bold text-[11px] leading-tight">{item.name}, {item.age}</h5>
                          <p className="text-[8px] opacity-80 mt-0.5">{item.tag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: HEALING */}
              {mockupTab === 'healing' && (
                <div className="flex-1 flex flex-col justify-between p-3 pt-0 relative overflow-hidden bg-gradient-to-b from-[#FFF5EE] to-[#FFF0EA]">
                  <div className="flex justify-between items-center px-1 py-1 mb-1 z-20 relative text-left">
                    <h3 className="font-display font-bold text-lg text-brand-on-surface">Healing Space</h3>
                    <span className="text-[9px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mindful</span>
                  </div>

                  {healingStage === 'select' ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-2 gap-4">
                      <p className="text-xs font-bold text-[#A26D53]">Cảm xúc của bạn lúc này?</p>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {[
                          { mood: "Bình yên", emoji: "🧘‍♀️", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { mood: "Mệt mỏi", emoji: "😴", color: "bg-amber-50 text-amber-700 border-amber-100" },
                          { mood: "Lo âu", emoji: "😔", color: "bg-red-50 text-red-700 border-red-100" },
                          { mood: "Hạnh phúc", emoji: "😊", color: "bg-pink-50 text-pink-700 border-pink-100" }
                        ].map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSelectMood(item.mood)}
                            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer ${item.color}`}
                          >
                            <span className="text-xl">{item.emoji}</span>
                            <span className="text-[10px] font-bold">{item.mood}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-2 gap-4">
                      <p className="text-[11px] font-medium text-[#A26D53]">
                        Ghi nhận cảm xúc: <span className="font-bold text-brand-primary">{selectedMood}</span>
                      </p>
                      
                      {/* Breathing Circle Animation */}
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 relative"
                      >
                        <div className="w-14 h-14 rounded-full bg-brand-primary/40 flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">Thở đều</span>
                        </div>
                      </motion.div>

                      <p className="text-[10px] text-neutral-500 italic max-w-[85%] leading-relaxed">
                        {"\"Hít vào thật sâu cảm giác bình yên, thở ra nhẹ nhàng xua tan căng thẳng...\""}
                      </p>

                      <button 
                        onClick={() => {
                          setHealingStage('select');
                          setSelectedMood(null);
                        }}
                        className="text-[10px] font-bold text-brand-primary underline hover:opacity-85 cursor-pointer mt-1"
                      >
                        Chọn cảm xúc khác
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CHAT */}
              {mockupTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between p-3 pt-0 relative overflow-hidden bg-neutral-50">
                  <div className="flex justify-between items-center px-1 py-1 border-b border-neutral-100 z-20 relative bg-neutral-50 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">AI</div>
                      <div>
                        <h4 className="font-bold text-xs text-brand-on-surface">Bondy AI Coach</h4>
                        <p className="text-[8px] text-emerald-500 font-medium">Trực tuyến</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">Gợi ý mở lời</span>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 py-2 overflow-y-auto flex flex-col gap-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[10px] text-left leading-normal ${
                          msg.sender === 'user' 
                            ? 'bg-brand-primary text-white rounded-tr-none' 
                            : 'bg-white border border-neutral-100 text-brand-on-surface rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Quick Replies */}
                  <div className="flex flex-col gap-1.5 mb-2 text-left">
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider pl-1">Bạn có thể trả lời:</p>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleSendChatOption("Mình hơi mệt mỏi vì công việc")}
                        className="bg-white border border-neutral-100 hover:bg-neutral-50 text-[10px] text-brand-on-surface px-2.5 py-1.5 rounded-xl text-left font-medium transition-colors cursor-pointer"
                      >
                        {"\"Mình hơi mệt mỏi vì công việc 😪\""}
                      </button>
                      <button 
                        onClick={() => handleSendChatOption("Hôm nay của mình rất tuyệt!")}
                        className="bg-white border border-neutral-100 hover:bg-neutral-50 text-[10px] text-brand-on-surface px-2.5 py-1.5 rounded-xl text-left font-medium transition-colors cursor-pointer"
                      >
                        {"\"Hôm nay của mình rất tuyệt! 😊\""}
                      </button>
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="flex items-center gap-2 bg-white rounded-full py-1.5 px-3 border border-neutral-200 shadow-xs">
                    <input 
                      type="text" 
                      placeholder="Nhập tin nhắn..." 
                      className="flex-1 bg-transparent text-[10px] focus:outline-none" 
                      disabled
                    />
                    <button className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white opacity-50">
                      <Send size={10} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: PROFILE */}
              {mockupTab === 'profile' && (
                <div className="flex-1 flex flex-col justify-between p-3 pt-0 relative overflow-y-auto">
                  <div className="flex justify-between items-center px-1 py-1 mb-2 z-20 relative text-left">
                    <h3 className="font-display font-bold text-lg text-brand-on-surface">Hồ sơ cá nhân</h3>
                    <span className="text-[9px] bg-brand-secondary/15 text-brand-secondary font-bold px-2 py-0.5 rounded-full border border-brand-secondary/20">Verified</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1 pt-2">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-primary p-0.5 shadow-md">
                      <img src="/bondy-heart-icon.png" alt="Avatar" className="w-full h-full object-cover rounded-full bg-white" />
                    </div>
                    <h4 className="font-bold text-sm text-brand-on-surface">Bạn, 25</h4>
                    <p className="text-[9px] text-neutral-400 font-medium">Thành viên Thấu cảm Bondy</p>

                    <div className="w-full bg-brand-surface-container/60 border border-brand-outline rounded-2xl p-3 text-left mt-2 flex flex-col gap-2.5">
                      <div>
                        <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Trạng thái cảm xúc</p>
                        <p className="text-[10px] font-bold text-brand-primary mt-0.5">🧘‍♀️ Đang hồi phục năng lượng</p>
                      </div>
                      <div className="h-px bg-brand-outline"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-xl border border-neutral-100 text-center">
                          <p className="text-base font-bold text-brand-secondary">92%</p>
                          <p className="text-[7px] text-neutral-400 uppercase tracking-widest font-semibold mt-0.5">Độ đồng điệu</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-neutral-100 text-center">
                          <p className="text-base font-bold text-brand-primary">3</p>
                          <p className="text-[7px] text-neutral-400 uppercase tracking-widest font-semibold mt-0.5">Matches mới</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation Bar of Phone Mockup */}
            <div className="h-14 bg-white border-t border-neutral-100 flex justify-around items-center px-2 pt-1 pb-2 z-20 relative shrink-0">
              <button 
                onClick={() => setMockupTab('home')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${mockupTab === 'home' ? 'text-brand-primary' : 'text-neutral-400 hover:text-brand-primary'}`}
              >
                <Home size={18} className={mockupTab === 'home' ? 'stroke-[2.5]' : ''} />
              </button>
              <button 
                onClick={() => setMockupTab('explore')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${mockupTab === 'explore' ? 'text-brand-primary' : 'text-neutral-400 hover:text-brand-primary'}`}
              >
                <Compass size={18} className={mockupTab === 'explore' ? 'stroke-[2.5]' : ''} />
              </button>
              
              {/* Central Heart Button (Healing tab) */}
              <button 
                onClick={() => setMockupTab('healing')}
                className={`w-10 h-10 rounded-full bg-white shadow-md border flex items-center justify-center -mt-6 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  mockupTab === 'healing' 
                    ? 'border-brand-primary text-brand-primary fill-brand-primary/10 shadow-brand-primary/20' 
                    : 'border-neutral-100 text-brand-primary'
                }`}
              >
                <Heart size={20} className={`stroke-[2.5] ${mockupTab === 'healing' ? 'fill-brand-primary/20' : ''}`} />
              </button>

              <button 
                onClick={() => setMockupTab('chat')}
                className={`flex flex-col items-center justify-center relative transition-colors cursor-pointer ${mockupTab === 'chat' ? 'text-brand-primary' : 'text-neutral-400 hover:text-brand-primary'}`}
              >
                <MessageCircle size={18} className={mockupTab === 'chat' ? 'stroke-[2.5]' : ''} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
              </button>
              <button 
                onClick={() => setMockupTab('profile')}
                className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${mockupTab === 'profile' ? 'text-brand-primary' : 'text-neutral-400 hover:text-brand-primary'}`}
              >
                <User size={18} className={mockupTab === 'profile' ? 'stroke-[2.5]' : ''} />
              </button>
            </div>
          </motion.div>

          {/* Floating Bubbles */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-12 frosted-glass p-4 rounded-2xl shadow-lg z-30 flex items-center gap-3"
          >
            <div className="bg-brand-primary/10 p-2 rounded-full"><MessageCircle size={20} className="text-brand-primary" /></div>
            <span className="font-semibold text-sm">AI gợi ý mở lời</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 -right-8 frosted-glass p-4 rounded-2xl shadow-lg z-30 flex items-center gap-3"
          >
            <div className="bg-brand-secondary/10 p-2 rounded-full"><Heart size={20} className="text-brand-secondary" /></div>
            <span className="font-semibold text-sm">Match theo sự tương đồng</span>
          </motion.div>

          <motion.div 
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/2 -right-12 frosted-glass p-4 rounded-2xl shadow-lg z-30 flex items-center gap-3"
          >
            <div className="bg-brand-tertiary/10 p-2 rounded-full"><Sprout size={20} className="text-brand-tertiary" /></div>
            <span className="font-semibold text-sm">Healing check-in</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SmartMatching = () => {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-5 order-2 lg:order-1">
        <div className="inline-flex items-center gap-2 bg-brand-surface-container-high text-brand-primary px-4 py-2 rounded-full mb-6 font-semibold text-sm">
          <Target size={16} /> Thuật toán thấu cảm
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Gợi ý kết nối phù hợp hơn</h2>
        <p className="text-lg text-brand-on-surface-variant mb-10 leading-relaxed">
          Bondy không chỉ ghép đôi qua hình ảnh. Chúng tôi tìm hiểu mục tiêu, sở thích và trạng thái cảm xúc của bạn qua các bài khảo sát tinh tế để mang đến những kết nối có chiều sâu thực sự.
        </p>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-surface-container-highest flex items-center justify-center shrink-0">
              <Brain className="text-brand-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Khảo sát cá nhân hóa</h4>
              <p className="text-brand-on-surface-variant">Câu hỏi thiết kế bởi chuyên gia tâm lý học.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-surface-container-highest flex items-center justify-center shrink-0">
              <Users className="text-brand-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Đồng điệu mục tiêu</h4>
              <p className="text-brand-on-surface-variant">Tìm kiếm những người cùng tần số cảm xúc.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 order-1 lg:order-2 relative">
        <div className="absolute inset-0 bg-brand-primary/5 -rotate-3 rounded-sanctuary-xl"></div>
        <div className="frosted-glass rounded-sanctuary-xl p-6 shadow-sanctuary relative">
          <div className="relative h-[450px] rounded-3xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Person" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-3xl font-bold">Minh Anh, 26</h3>
              <p className="opacity-90">Hà Nội • Thiết kế đồ họa</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-brand-surface-container px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-semibold text-brand-primary"><Target size={14} /> Cùng mục tiêu</span>
            <span className="bg-brand-surface-container px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-semibold text-brand-primary"><MapPin size={14} /> Gần bạn</span>
            <span className="bg-brand-surface-container px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-semibold text-brand-primary"><Heart size={14} /> Tương đồng cảm xúc</span>
            <span className="bg-brand-surface-container px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-semibold text-brand-primary"><Coffee size={14} /> Thích cà phê sách</span>
          </div>

          <div className="absolute -bottom-6 -right-6 frosted-glass p-5 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary-container text-white flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Độ tương thích</p>
              <p className="text-3xl font-bold text-brand-primary">92%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const AICoach = () => {
  return (
    <section id="coach" className="py-24 bg-brand-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="frosted-glass rounded-[3rem] p-6 shadow-sanctuary max-w-md mx-auto">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div>
                  <h4 className="font-bold">Hoàng Anh</h4>
                  <p className="text-xs text-brand-tertiary font-medium">Vừa truy cập</p>
               </div>
            </div>

            {/* Chat bubble */}
            <div className="flex gap-3 mb-6">
               <div className="w-8 h-8 rounded-full bg-neutral-100 shrink-0 mt-auto"></div>
               <div className="bg-brand-surface-container px-5 py-3 rounded-2xl rounded-bl-none text-sm">
                 Chào bạn, mình thấy bạn cũng thích đọc sách của Murakami?
               </div>
            </div>

            {/* AI Suggestion */}
            <div className="bg-brand-primary/5 rounded-2xl p-5 border border-brand-primary/10 relative">
               <div className="absolute -top-3 left-4 bg-brand-primary-container text-on-primary-container px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                 <Brain size={12} /> AI GỢI Ý
               </div>
               <div className="flex flex-col gap-3 mt-2">
                 <button className="bg-white hover:bg-neutral-50 transition-colors border border-neutral-100 p-3 rounded-xl text-left text-sm flex justify-between items-center group">
                    <span>{"\"Đúng rồi, mình vừa đọc xong Rừng Na Uy. Bạn ấn tượng...\""}</span>
                    <span className="text-[10px] bg-neutral-100 px-2 py-1 rounded opacity-0 group-hover:opacity-100">Hỏi sâu hơn</span>
                 </button>
                 <button className="bg-white hover:bg-neutral-50 transition-colors border border-neutral-100 p-3 rounded-xl text-left text-sm flex justify-between items-center group">
                    <span>{"\"Chào Hoàng Anh, cuốn 1Q84 hơi khó hiểu nhưng rất cuốn hút...\""}</span>
                    <span className="text-[10px] bg-neutral-100 px-2 py-1 rounded opacity-0 group-hover:opacity-100">Mở lời nhẹ nhàng</span>
                 </button>
               </div>
            </div>

            {/* Input field */}
            <div className="mt-8 flex items-center gap-3 bg-neutral-50 rounded-full py-2 px-4 border border-neutral-100">
               <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
               <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-transparent text-sm focus:outline-none" />
               <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-white">
                 <ArrowRight size={16} />
               </div>
            </div>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full mb-6 font-semibold text-sm">
            <MessageCircle size={16} /> AI Conversation Coach
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Không biết bắt chuyện thế nào? Để Bondy gợi ý.</h2>
          <p className="text-lg text-brand-on-surface-variant mb-10 leading-relaxed">
            Đôi khi bước khó nhất là gửi tin nhắn đầu tiên. Trợ lý AI của chúng tôi phân tích hồ sơ và bối cảnh để đưa ra những gợi ý mở lời tự nhiên, tinh tế, giúp cuộc trò chuyện diễn ra trôi chảy mà vẫn giữ được sự chân thành.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                <Smile className="text-brand-primary mx-auto mb-3" />
                <span className="font-bold text-sm">Mở lời nhẹ nhàng</span>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                <Brain className="text-brand-primary mx-auto mb-3" />
                <span className="font-bold text-sm">Hỏi sâu hơn</span>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                <Coffee className="text-brand-primary mx-auto mb-3" />
                <span className="font-bold text-sm">Rủ đi date</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const HealingSpace = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodDetails = {
    wind: {
      title: "Bình yên",
      icon: Wind,
      color: "text-brand-tertiary bg-brand-tertiary/10 border-brand-tertiary/40",
      glowColor: "shadow-brand-tertiary/30 bg-brand-tertiary/5",
      reflection: "Tuyệt vời! Hãy lưu giữ khoảnh khắc bình yên này trong tâm trí và chia sẻ năng lượng tích cực này tới những người bạn thương yêu."
    },
    meh: {
      title: "Mệt mỏi",
      icon: Meh,
      color: "text-brand-secondary bg-brand-secondary/10 border-brand-secondary/40",
      glowColor: "shadow-brand-secondary/30 bg-brand-secondary/5",
      reflection: "Hôm nay bạn đã cố gắng nhiều rồi. Hãy tạm tắt màn hình, hít thở sâu và cho phép cơ thể được nghỉ ngơi nhé."
    },
    heart: {
      title: "Hạnh phúc",
      icon: Heart,
      color: "text-brand-primary bg-brand-primary/10 border-brand-primary/40",
      glowColor: "shadow-brand-primary/30 bg-brand-primary/5",
      reflection: "Niềm vui sẽ nhân lên gấp bội khi được chia sẻ. Bạn có muốn viết vài dòng nhật ký cảm xúc để ghi nhớ ngày hôm nay?"
    },
    frown: {
      title: "Lo âu",
      icon: Frown,
      color: "text-red-500 bg-red-100 dark:bg-red-950/20 border-red-500/40",
      glowColor: "shadow-red-500/30 bg-red-500/5",
      reflection: "Hít vào thật sâu trong 4 giây, giữ lại 7 giây và thở ra chậm rãi trong 8 giây. Bạn đang làm rất tốt, mọi chuyện rồi sẽ ổn thôi."
    }
  };

  return (
    <section id="healing" className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 lg:pr-12">
          <div className="flex gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1.5">
              <Sparkles size={14} /> Tự thấu cảm
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 flex items-center gap-1.5">
              <Lock size={14} /> Riêng tư & Bảo mật
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Healing Space – Góc riêng để thấu cảm bản thân
          </h2>
          <p className="text-xl text-brand-on-surface-variant mb-12 leading-relaxed">
            Dành ra một vài phút mỗi ngày để check-in cảm xúc của bạn. Bondy kết hợp với công nghệ AI Reflection giúp bạn phân tích, ghi nhận và xoa dịu những nhịp điệu tâm hồn đang xao động. Một không gian hoàn toàn riêng tư, an toàn và thấu hiểu.
          </p>
          <a href="#download" onClick={(e) => handleLinkClick(e, 'download')} className="inline-flex accent-gradient text-white font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all items-center gap-3">
            Trải nghiệm ngay <ArrowRight size={20} />
          </a>
        </div>

        <div className="order-1 lg:order-2 relative py-12">
          {/* Backdrop Glow */}
          <div className="absolute inset-0 bg-[#FD7000]/10 blur-[100px] rounded-full scale-110"></div>
          
          <div className="relative frosted-glass rounded-[2rem] p-10 max-w-md mx-auto shadow-sanctuary border border-brand-outline-variant/20">
             <div className="text-center mb-10">
                <h3 className="text-2xl font-bold mb-3">Hôm nay bạn đang cảm thấy thế nào?</h3>
                <p className="text-brand-on-surface-variant">Chọn một trạng thái gần nhất với bạn lúc này.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
                {(Object.keys(moodDetails) as Array<keyof typeof moodDetails>).map((key) => {
                  const mood = moodDetails[key];
                  const MoodIcon = mood.icon;
                  const isSelected = selectedMood === key;
                  return (
                    <button 
                      key={key}
                      onClick={() => setSelectedMood(key)}
                      className={`group transition-all duration-300 p-6 rounded-3xl flex flex-col items-center gap-3 border text-center ${
                        isSelected 
                          ? `${mood.color} shadow-lg scale-[1.03] ${mood.glowColor}` 
                          : 'bg-brand-surface-container hover:bg-brand-surface-container-high border-transparent'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isSelected ? 'bg-transparent scale-110' : 'bg-brand-surface-container-highest'
                      } ${key === 'frown' && !isSelected ? 'text-red-500' : ''} ${key === 'heart' && !isSelected ? 'text-brand-primary' : ''} ${key === 'meh' && !isSelected ? 'text-brand-secondary' : ''} ${key === 'wind' && !isSelected ? 'text-brand-tertiary' : ''}`}>
                         <MoodIcon size={32} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="font-bold">{mood.title}</span>
                    </button>
                  );
                })}
             </div>

             <AnimatePresence mode="wait">
               {selectedMood && (
                 <motion.div
                   key={selectedMood}
                   initial={{ opacity: 0, height: 0, y: 10 }}
                   animate={{ opacity: 1, height: 'auto', y: 0 }}
                   exit={{ opacity: 0, height: 0, y: 10 }}
                   className="overflow-hidden"
                 >
                   <div className="p-5 rounded-2xl bg-brand-surface-container-high/60 border border-brand-outline-variant/30 flex gap-4">
                     <div className="w-10 h-10 shrink-0 rounded-full bg-brand-primary-container text-white flex items-center justify-center font-bold">
                       AI
                     </div>
                     <div className="flex-1">
                       <h4 className="text-sm font-semibold mb-1 text-brand-primary">AI Reflection gợi ý:</h4>
                       <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                         {moodDetails[selectedMood as keyof typeof moodDetails].reflection}
                       </p>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

const LoveSpace = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'milestone' | 'conflict'>('dashboard');
  const [severity, setSeverity] = useState(6);

  const tabs = [
    {
      id: 'dashboard' as const,
      label: "Bảng điều khiển cặp đôi",
      icon: Home,
      title: "Góc Mối Quan Hệ – Home Dashboard",
      desc: "Nơi cập nhật số ngày yêu nhau, chia sẻ cảm xúc hàng ngày và nhắc nhở các hoạt động chung. Giúp hai bạn luôn cập nhật trạng thái của đối phương trong nháy mắt."
    },
    {
      id: 'milestone' as const,
      label: "Ngày kỷ niệm & Sự kiện",
      icon: Calendar,
      title: "Milestone Reminders",
      desc: "Theo dõi các sự kiện sắp tới bằng đồng hồ đếm ngược trực quan. Đi kèm các ý tưởng hẹn hò độc đáo, thư viện lời nhắn lãng mạn gợi ý sẵn để hâm nóng tình cảm."
    },
    {
      id: 'conflict' as const,
      label: "Hòa giải mâu thuẫn",
      icon: HeartHandshake,
      title: "Conflict Resolution Tool",
      desc: "Tính năng đột phá giúp các cặp đôi tự chữa lành và đối thoại lành mạnh khi xảy ra bất đồng. Đánh giá mức độ, gọi tên cảm xúc và nhận lời khuyên hạ nhiệt từ Bondy Coach."
    }
  ];

  return (
    <section id="love-space" className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 inline-flex items-center gap-1.5 mb-4">
          <Heart size={14} /> Tính năng độc quyền
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Love Space – Không gian kết nối đôi lứa
        </h2>
        <p className="text-lg text-brand-on-surface-variant leading-relaxed">
          Gắn kết bền chặt hơn mỗi ngày với không gian số hóa dành riêng cho hai người. Từ chia sẻ cảm xúc, đếm ngược ngày yêu đến hòa giải xung đột một cách văn minh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Interactive Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center order-2 lg:order-1 relative">
          {/* Subtle glow behind phone */}
          <div className="absolute w-72 h-[500px] bg-brand-primary/10 blur-[80px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Phone Shell */}
          <div className="w-[320px] h-[640px] rounded-[3rem] border-8 border-brand-outline-variant bg-[#FFFBF9] shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-brand-outline/40 pt-3 pb-0">
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-600/80"></div>
              <div className="w-8 h-1 bg-neutral-700 rounded-full"></div>
            </div>

            {/* Status Bar */}
            <div className="h-7 px-6 flex justify-between items-center text-[10px] text-brand-on-surface/85 font-semibold z-30 select-none pt-2 shrink-0">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2 border border-brand-on-surface/50 rounded-sm relative p-0.5">
                  <div className="w-full h-full bg-brand-on-surface/80 rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* Phone Screens Container */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none relative flex flex-col bg-[#FFFBF9]">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4 pt-2 flex-1"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-brand-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <div className="relative flex -space-x-2">
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">N</div>
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700">L</div>
                          <div className="absolute -bottom-1 -right-1 bg-[#FF6B6B] text-white rounded-full p-0.5 text-[6px]">❤️</div>
                        </div>
                        <div>
                          <p className="text-[10px] text-brand-on-surface-variant font-medium">Chúng mình</p>
                          <h4 className="text-xs font-bold text-slate-800">Nam & Linh</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                        42 ngày
                      </span>
                    </div>

                    {/* Greeting */}
                    <div className="px-1">
                      <h3 className="text-sm font-bold text-brand-primary">Chào buổi sáng, Nam & Linh 👋</h3>
                      <p className="text-[10px] text-brand-on-surface-variant mt-0.5">Hôm nay của hai bạn thế nào?</p>
                    </div>

                    {/* Daily Action Card */}
                    <div className="bg-gradient-to-br from-[#FF6B6B]/10 to-[#4ECDC4]/10 p-4 rounded-2xl border border-brand-outline-variant/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-brand-primary/20 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg text-brand-primary">
                        HÀNH ĐỘNG HÔM NAY
                      </div>
                      <h4 className="text-[11px] font-bold text-brand-primary mb-1">Thử thách gắn kết</h4>
                      <p className="text-[10px] leading-normal font-medium mb-3 text-slate-800">
                        &quot;Hãy gửi cho người ấy một lời nhắn cảm ơn chân thành vì một hành động nhỏ họ đã làm cho bạn gần đây.&quot;
                      </p>
                      <div className="flex gap-2">
                        <button className="accent-gradient text-white text-[9px] font-bold py-1.5 px-3 rounded-full hover:shadow-md transition-shadow cursor-pointer">
                          Thực hiện
                        </button>
                        <button className="bg-white text-brand-on-surface text-[9px] font-medium py-1.5 px-3 rounded-full border border-brand-outline-variant/20 hover:bg-neutral-50 cursor-pointer">
                          Nhắc sau
                        </button>
                      </div>
                    </div>

                    {/* Couple Moods */}
                    <div className="bg-white p-3 rounded-2xl border border-brand-outline-variant/10">
                      <h4 className="text-[11px] font-bold mb-2 flex justify-between items-center text-slate-800">
                        <span>Cảm xúc hôm nay</span>
                        <span className="text-[9px] font-medium text-brand-on-surface-variant">Lịch sử &gt;</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-neutral-50 p-2 rounded-xl border border-brand-outline-variant/10 text-center">
                          <span className="text-xs font-bold text-indigo-600 block">Nam</span>
                          <span className="text-base my-0.5 block">😄</span>
                          <span className="text-[9px] text-brand-on-surface-variant font-medium">Vui vẻ</span>
                        </div>
                        <div className="bg-neutral-50 p-2 rounded-xl border border-brand-outline-variant/10 text-center">
                          <span className="text-xs font-bold text-pink-600 block">Linh</span>
                          <span className="text-base my-0.5 block">🌿</span>
                          <span className="text-[9px] text-brand-on-surface-variant font-medium">Bình yên</span>
                        </div>
                      </div>
                    </div>

                    {/* Reminder item */}
                    <div className="bg-white p-3 rounded-2xl border border-brand-outline-variant/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-slate-800">Hẹn hò tối thứ 6</p>
                          <p className="text-[9px] text-brand-on-surface-variant">19:00 @ Nhà hàng Sen Tây Hồ</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-brand-primary">14 ngày nữa</span>
                    </div>

                    {/* Coach Advice */}
                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex gap-2.5 items-start mt-auto">
                      <span className="text-sm">💡</span>
                      <div>
                        <h5 className="text-[10px] font-bold text-orange-700">Bondy Coach gợi ý</h5>
                        <p className="text-[9px] text-brand-on-surface-variant leading-relaxed">
                          Lắng nghe chủ động giúp tăng sự thấu hiểu và giảm thiểu các xung đột không đáng có đến 50%.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'milestone' && (
                  <motion.div
                    key="milestone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4 pt-2 flex-1"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold flex items-center gap-1.5 text-slate-800">
                        <Calendar size={14} className="text-brand-primary" /> Ngày kỷ niệm sắp tới
                      </h3>
                    </div>

                    {/* Anniversary Banner Card */}
                    <div className="bg-gradient-to-tr from-[#FF6B6B] to-[#4ECDC4] text-white p-4 rounded-2xl relative overflow-hidden shadow-md">
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                      <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1.5">SẮP DIỄN RA</span>
                      <h4 className="text-xs font-bold mb-1 leading-snug">Kỷ niệm 2 năm chung đôi</h4>
                      <p className="text-[9px] text-white/80 mb-3">Ngày đánh dấu cột mốc hai ta bắt đầu yêu</p>
                      
                      {/* Countdown Grid */}
                      <div className="flex gap-2">
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg py-1 px-2.5 text-center min-w-[36px]">
                          <span className="text-xs font-bold block">05</span>
                          <span className="text-[7px] text-white/70 uppercase">Ngày</span>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg py-1 px-2.5 text-center min-w-[36px]">
                          <span className="text-xs font-bold block">12</span>
                          <span className="text-[7px] text-white/70 uppercase">Giờ</span>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions Box */}
                    <div className="bg-white p-3 rounded-2xl border border-brand-outline-variant/10">
                      <h4 className="text-[11px] font-bold mb-2 text-slate-800">Gợi ý cho ngày này</h4>
                      <div className="flex gap-1.5 mb-3">
                        <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-bold rounded-full">✉️ Tin nhắn</span>
                        <span className="px-2.5 py-1 bg-brand-secondary/10 text-brand-secondary text-[9px] font-bold rounded-full">🌹 Hẹn hò</span>
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[9px] font-bold rounded-full">🎁 Quà tặng</span>
                      </div>
                      
                      {/* Suggestion Card */}
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-brand-outline-variant/10">
                        <p className="text-[9px] italic text-brand-on-surface-variant leading-relaxed">
                          &quot;Thinking of you. Cảm ơn vì đã luôn đồng hành, thấu hiểu và chia sẻ mọi buồn vui cùng em trong 2 năm qua...&quot;
                        </p>
                        <button className="mt-2 text-[9px] text-brand-primary font-bold flex items-center gap-1 hover:underline cursor-pointer">
                          📋 Sao chép tin nhắn gợi ý
                        </button>
                      </div>
                    </div>

                    {/* Plan event button */}
                    <button className="w-full accent-gradient text-white text-xs font-bold py-2.5 rounded-xl shadow-md mt-auto cursor-pointer">
                      Lên kế hoạch hẹn hò ngay
                    </button>
                  </motion.div>
                )}

                {activeTab === 'conflict' && (
                  <motion.div
                    key="conflict"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-3 pt-2 flex-1"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <HeartHandshake size={14} className="text-red-500" />
                      <h3 className="text-xs font-bold">Giải quyết mâu thuẫn</h3>
                    </div>

                    {/* Intro Alert Box */}
                    <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 p-2.5 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-red-600">Chúng mình đang có vướng mắc?</p>
                      <p className="text-[8px] text-brand-on-surface-variant mt-0.5">Hãy bình tĩnh chia sẻ cảm xúc để cùng thấu hiểu.</p>
                    </div>

                    {/* Step 1: Issue Classification */}
                    <div className="bg-white p-2.5 rounded-xl border border-brand-outline-variant/10">
                      <span className="text-[9px] font-bold text-brand-primary block mb-1">1. Vấn đề nằm ở đâu?</span>
                      <div className="grid grid-cols-4 gap-1">
                        <div className="border border-red-500/50 bg-red-500/5 rounded-lg p-1.5 text-center flex flex-col items-center gap-0.5 cursor-pointer">
                          <span className="text-[12px]">💬</span>
                          <span className="text-[7px] font-bold text-red-600">Giao tiếp</span>
                        </div>
                        <div className="border border-transparent bg-neutral-50 rounded-lg p-1.5 text-center flex flex-col items-center gap-0.5 opacity-60">
                          <span className="text-[12px]">💰</span>
                          <span className="text-[7px] font-semibold text-slate-700">Tài chính</span>
                        </div>
                        <div className="border border-transparent bg-neutral-50 rounded-lg p-1.5 text-center flex flex-col items-center gap-0.5 opacity-60">
                          <span className="text-[12px]">🏠</span>
                          <span className="text-[7px] font-semibold text-slate-700">Việc nhà</span>
                        </div>
                        <div className="border border-transparent bg-neutral-50 rounded-lg p-1.5 text-center flex flex-col items-center gap-0.5 opacity-60">
                          <span className="text-[12px]">⏰</span>
                          <span className="text-[7px] font-semibold text-slate-700">Giờ giấc</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Severity Slider */}
                    <div className="bg-white p-2.5 rounded-xl border border-brand-outline-variant/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-brand-primary">2. Mức độ nghiêm trọng?</span>
                        <span className="text-[10px] font-bold text-red-600">{severity}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className="w-full accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[7px] text-brand-on-surface-variant font-medium mt-1">
                        <span>Khó chịu</span>
                        <span>Gay gắt</span>
                      </div>
                    </div>

                    {/* Step 3: Details */}
                    <div className="bg-white p-2.5 rounded-xl border border-brand-outline-variant/10">
                      <span className="text-[9px] font-bold text-brand-primary block mb-1">3. Chi tiết vấn đề</span>
                      <textarea 
                        readOnly={true}
                        value="Hôm nay mình thấy hơi buồn và bất an vì đối phương quên mất cuộc gọi điện tối qua..."
                        className="w-full text-[8px] bg-neutral-50 p-2 rounded-lg border border-brand-outline-variant/20 resize-none text-slate-700 font-medium"
                        rows={2}
                      />
                    </div>

                    {/* Coach suggestion */}
                    <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl mt-auto">
                      <span className="text-[9px] font-bold text-blue-700 block mb-0.5">💡 Coach gợi ý hạ nhiệt</span>
                      <p className="text-[8px] leading-relaxed text-brand-on-surface-variant">
                        Dành 15 phút không gian riêng cho mỗi người để bình tĩnh lại trước khi bắt đầu thảo luận.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Bar Simulator */}
            <div className="h-12 border-t border-neutral-100 bg-white px-6 flex justify-between items-center text-[10px] text-slate-500 font-bold shrink-0 select-none">
              <span className={activeTab === 'dashboard' ? 'text-brand-primary font-extrabold' : 'opacity-60'}>🏠 Home</span>
              <span className={activeTab === 'milestone' ? 'text-brand-primary font-extrabold' : 'opacity-60'}>📅 Lịch</span>
              <span className="opacity-60">💬 Chat</span>
              <span className={activeTab === 'conflict' ? 'text-brand-primary font-extrabold' : 'opacity-60'}>🤝 Hỗ trợ</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tab Controller & Content */}
        <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
          <div className="flex flex-col gap-4">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? 'bg-white dark:bg-brand-surface-container-high border-brand-primary/40 shadow-lg scale-[1.01]' 
                      : 'bg-transparent border-brand-outline-variant/10 hover:border-brand-outline-variant/40 hover:bg-white/20 dark:hover:bg-brand-surface-container/20'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      isActive 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-brand-surface-container text-brand-on-surface-variant group-hover:text-brand-primary'
                    }`}>
                      <TabIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-lg text-brand-on-surface">{tab.label}</h3>
                        {isActive && (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full">
                            Đang xem
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const BentoFeatures = () => {
  return (
    <section id="explore" className="py-24 bg-brand-surface-container-low rounded-sanctuary-xl mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Những gì bạn có thể làm với Bondy</h2>
          <p className="text-lg text-brand-on-surface-variant">Hệ sinh thái tính năng được thiết kế để kết nối, chữa lành và đồng hành cùng bạn trên mọi hành trình cảm xúc.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: Hồ sơ cá nhân hóa sâu sắc (col-span-2) */}
          <div className="md:col-span-2 frosted-glass rounded-sanctuary-lg p-8 flex flex-col md:flex-row justify-between relative overflow-hidden group">
            <div className="relative z-10 md:max-w-[55%] flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-full bg-brand-primary-container text-white flex items-center justify-center mb-6">
                  <User size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Hồ sơ cá nhân hóa sâu sắc</h3>
                <p className="text-brand-on-surface-variant text-sm leading-relaxed mb-4">
                  Thể hiện bản thân chân thật qua sở thích, nhịp sinh học và phong cách giao tiếp riêng biệt thay vì chỉ qua hình ảnh hào nhoáng bên ngoài.
                </p>
              </div>
              <ul className="text-xs text-brand-on-surface-variant space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                  Khảo sát MBTI & Phong cách yêu thương
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                  Nhịp sinh học sinh hoạt tự nhiên
                </li>
              </ul>
            </div>
            
            {/* Visual Profile Mockup */}
            <div className="hidden md:flex flex-1 items-center justify-center relative pl-4 z-10">
              <div className="w-[250px] bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-brand-outline-variant/30 transform rotate-2 group-hover:rotate-0 transition-transform duration-500 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-outline-variant">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-brand-on-surface">Khánh Vy, 24</h5>
                    <p className="text-[10px] text-brand-on-surface-variant">Hà Nội • 3.2km</p>
                  </div>
                </div>
                <p className="text-[11px] text-brand-on-surface-variant leading-relaxed italic">
                  {"\"Tìm kiếm những cuộc trò chuyện sâu sắc dưới ánh trăng...\""}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-primary/20 flex items-center gap-0.5">
                    <Sparkles size={8} /> INFJ
                  </span>
                  <span className="bg-brand-secondary/10 text-brand-secondary text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-secondary/20 flex items-center gap-0.5">
                    <Moon size={8} /> Cú đêm
                  </span>
                  <span className="bg-brand-tertiary/10 text-brand-tertiary text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-tertiary/20 flex items-center gap-0.5">
                    <Coffee size={8} /> Trà chiều
                  </span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-brand-primary-container/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </div>

          {/* Card 2: Khám phá kết nối mới (col-span-1) */}
          <div className="frosted-glass rounded-sanctuary-lg p-8 flex flex-col justify-between group overflow-hidden relative">
            <div>
              <div className="w-12 h-12 rounded-full bg-brand-secondary text-white flex items-center justify-center mb-6 shadow-sm">
                <Compass size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Khám phá kết nối</h3>
              <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                Tìm kiếm những tâm hồn đồng điệu dựa trên sự tương thích về hệ giá trị cuộc sống.
              </p>
            </div>
            
            {/* Matching UI Mockup */}
            <div className="relative flex items-center justify-center h-24 mt-2">
              <div className="absolute w-24 h-24 rounded-full border border-brand-primary/20 animate-ping opacity-40"></div>
              <div className="absolute w-16 h-16 rounded-full border border-brand-secondary/25 animate-ping opacity-50 delay-700"></div>
              
              <div className="flex items-center z-10">
                <div className="w-12 h-12 rounded-full border-2 border-brand-primary overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="User 1" className="w-full h-full object-cover" />
                </div>
                <div className="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 border-2 border-white -mx-3 shadow-md">
                  95%
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-brand-secondary overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="User 2" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Trò chuyện an toàn (col-span-1) */}
          <div className="frosted-glass rounded-sanctuary-lg p-8 flex flex-col justify-between group overflow-hidden relative">
            <div>
              <div className="w-12 h-12 rounded-full bg-brand-tertiary text-white flex items-center justify-center mb-6 shadow-sm">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Trò chuyện an toàn</h3>
              <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                Không gian nhắn tin riêng tư, được bảo vệ bởi công cụ tự động lọc từ ngữ độc hại.
              </p>
            </div>
            
            {/* Safe Chat Mockup */}
            <div className="bg-brand-surface-container-low/40 rounded-xl p-3 border border-brand-outline flex flex-col gap-2 mt-2">
              <div className="bg-brand-primary text-white text-[10px] py-1.5 px-2.5 rounded-xl rounded-tr-none self-end max-w-[90%] font-medium">
                Hôm nay bạn thế nào?
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-brand-on-surface-variant/80 font-bold self-center bg-white/80 py-1 px-3 rounded-full shadow-xs border border-brand-outline">
                <Lock size={10} className="text-green-500" /> Tin nhắn đã mã hóa đầu cuối
              </div>
            </div>
          </div>

          {/* Card 4: AI Coach đồng hành (col-span-2) */}
          <div className="md:col-span-2 accent-gradient text-white rounded-sanctuary-lg p-8 flex flex-col md:flex-row justify-between relative overflow-hidden group">
            <div className="relative z-10 md:max-w-[55%] flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Coach đồng hành</h3>
                <p className="opacity-90 text-sm leading-relaxed mb-4">
                  Người bạn ảo luôn lắng nghe 24/7, cung cấp các gợi ý mở lời tự nhiên khi kết nối và các bài tập chánh niệm thiết kế riêng cho trạng thái tinh thần của bạn.
                </p>
              </div>
              <ul className="text-xs opacity-90 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Gợi ý câu bắt chuyện thông minh, tự nhiên
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Lắng nghe & phản hồi không phán xét
                </li>
              </ul>
            </div>
            
            {/* AI Conversation Mockup */}
            <div className="hidden md:flex flex-1 items-center justify-center relative pl-4 z-10">
              <div className="w-[260px] bg-white/95 rounded-2xl p-4 shadow-xl text-brand-on-surface flex flex-col gap-3.5 border border-brand-outline-variant/30">
                <div className="flex items-center gap-2 border-b border-brand-outline pb-2">
                  <div className="w-7 h-7 rounded-full bg-brand-primary-container text-white flex items-center justify-center">
                    <Brain size={14} />
                  </div>
                  <span className="font-bold text-xs">AI Coach</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 ml-auto animate-pulse"></span>
                </div>
                <div className="bg-brand-surface-container/60 p-2.5 rounded-xl rounded-tl-none text-[11px] leading-relaxed text-brand-on-surface-variant font-medium">
                  Chào bạn! Mình thấy bạn đang cảm thấy lo âu một chút. Chúng ta cùng chạy bài tập thở 3 phút nhé?
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="border border-brand-primary/20 text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg bg-brand-primary/5 text-center cursor-pointer hover:bg-brand-primary/10 transition-colors">
                    🧘 Đồng ý, hướng dẫn mình hít thở
                  </div>
                  <div className="border border-brand-outline text-brand-on-surface-variant text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-white text-center cursor-pointer hover:bg-neutral-50 transition-colors">
                    💬 Chỉ muốn chia sẻ câu chuyện thôi
                  </div>
                </div>
              </div>
              <div className="absolute right-[-5%] top-[-5%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:translate-x-4 transition-transform duration-700"></div>
            </div>
          </div>

          {/* Card 5: Vườn Tâm Hồn (col-span-1) */}
          <div className="frosted-glass rounded-sanctuary-lg p-8 flex flex-col justify-between group overflow-hidden relative">
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-6 shadow-xs">
                <Heart size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Vườn Tâm Hồn</h3>
              <p className="text-sm text-brand-on-surface-variant leading-relaxed">
                Nhật ký theo dõi cảm xúc hàng ngày để thấu hiểu và nhận báo cáo xu hướng tâm lý mỗi tuần.
              </p>
            </div>
            
            {/* Mood Tracker visual mock */}
            <div className="flex items-center justify-between gap-1.5 bg-white/60 p-3 rounded-2xl border border-brand-outline-variant/30 mt-2 shadow-xs">
              {[
                { label: 'T2', emoji: '😊', active: true },
                { label: 'T3', emoji: '😔', active: false },
                { label: 'T4', emoji: '🌿', active: true },
                { label: 'T5', emoji: '✨', active: true },
                { label: 'T6', emoji: '🧘', active: true }
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-lg transition-all ${item.active ? 'bg-brand-primary/10 border border-brand-primary/20 scale-105' : 'opacity-60'}`}>
                  <span className="text-[9px] font-bold text-brand-on-surface-variant">{item.label}</span>
                  <span className="text-sm">{item.emoji}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Thư viện nội dung tâm lý (col-span-2) */}
          <div className="md:col-span-2 bg-white/80 border-2 border-brand-outline rounded-sanctuary-lg p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="relative z-10 md:max-w-[50%] flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6">
                  <Sprout size={26} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Thư viện tâm lý học</h3>
                <p className="text-brand-on-surface-variant text-sm leading-relaxed">
                  Tiếp cận các tài nguyên khoa học hành vi, podcast chữa lành tâm hồn và các bài hướng dẫn Mindfulness thực hành thiết kế riêng bởi chuyên gia tâm lý học.
                </p>
              </div>
            </div>
            
            {/* Library Content Previews */}
            <div className="relative z-10 flex-1 flex flex-col gap-3 w-full">
              {/* Preview 1 */}
              <div className="bg-white rounded-xl p-3 border border-brand-outline-variant shadow-xs flex items-center gap-3 w-full hover:border-brand-primary/40 transition-colors cursor-pointer group/item">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 group-hover/item:scale-105 transition-transform">
                  <Headphones size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs truncate text-brand-on-surface group-hover/item:text-brand-primary transition-colors">Podcast #24: Đối diện sự cô đơn</h5>
                  <p className="text-[10px] text-brand-on-surface-variant/80 mt-0.5 font-medium">15 phút • Host Cát Tường</p>
                </div>
              </div>
              
              {/* Preview 2 */}
              <div className="bg-white rounded-xl p-3 border border-brand-outline-variant shadow-xs flex items-center gap-3 w-full hover:border-brand-secondary/40 transition-colors cursor-pointer group/item">
                <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0 group-hover/item:scale-105 transition-transform">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs truncate text-brand-on-surface group-hover/item:text-brand-secondary transition-colors">Vượt qua trạng thái Overthinking</h5>
                  <p className="text-[10px] text-brand-on-surface-variant/80 mt-0.5 font-medium">5 phút đọc • Dr. Nguyễn Minh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Security = () => {
    return (
        <section id="security" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Một không gian kết nối an toàn hơn</h2>
                <p className="text-lg text-brand-on-surface-variant max-w-2xl mx-auto mb-20">{"Chúng tôi xây dựng Bondy như một \"Thánh đường kỹ thuật số\" – nơi bạn được là chính mình mà không sợ bị phán xét."}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShieldCheck, title: "Bảo mật thông tin", desc: "Dữ liệu cá nhân của bạn được mã hóa an toàn. Bạn có toàn quyền kiểm soát những gì mình chia sẻ." },
                        { icon: Heart, title: "Hỗ trợ cảm xúc", desc: "Cộng đồng được xây dựng dựa trên sự đồng cảm. Các tính năng báo cáo giúp duy trì môi trường tích cực." },
                        { icon: CheckCircle2, title: "Xác thực hồ sơ", desc: "Hệ thống xác thực ảnh nghiêm ngặt giúp loại bỏ tài khoản giả mạo, đảm bảo tương tác với người thật." }
                    ].map((item, i) => (
                        <div key={i} className="p-10 rounded-sanctuary-lg bg-brand-surface-container-low hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-8">
                                <item.icon className="text-brand-primary" size={32} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                            <p className="text-brand-on-surface-variant leading-relaxed italic">{"\"" + item.desc + "\""}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const DownloadSection = () => {
    return (
        <section id="download" className="py-24 max-w-7xl mx-auto px-6">
            <div className="frosted-glass rounded-sanctuary-xl p-12 md:p-20 shadow-sanctuary grid grid-cols-1 lg:grid-cols-2 gap-16 items-center overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                
                <div className="z-10">
                    <h2 className="text-4xl font-bold mb-12">Tải Bondy APK cho Android</h2>
                    <div className="space-y-10">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-xl bg-brand-surface-container flex items-center justify-center shrink-0">
                                <Download className="text-brand-primary" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Bước 1: Tải file APK</h4>
                                <p className="text-brand-on-surface-variant">Nhấn vào nút tải xuống bên dưới để lưu file cài đặt Bondy về máy.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-xl bg-brand-surface-container flex items-center justify-center shrink-0">
                                <Settings className="text-brand-primary" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Bước 2: Cấp quyền cài đặt</h4>
                                <p className="text-brand-on-surface-variant">Vào Cài đặt {'>'} Bảo mật {'>'} Cho phép cài đặt ứng dụng từ nguồn không xác định.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-xl bg-brand-surface-container flex items-center justify-center shrink-0">
                                <Smartphone className="text-brand-primary" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Bước 3: Cài đặt & Trải nghiệm</h4>
                                <p className="text-brand-on-surface-variant">Mở file vừa tải về và tiến hành cài đặt. Tạo tài khoản và bắt đầu kết nối.</p>
                            </div>
                        </div>
                    </div>
                    <button className="accent-gradient text-white font-bold py-5 px-10 rounded-full mt-12 shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                        <Download size={24} /> Tải APK về máy
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-6 z-10">
                    <div className="flex flex-col items-center justify-center bg-white p-10 rounded-[3rem] shadow-2xl relative">
                        <div className="absolute -top-6 bg-white p-2 rounded-full shadow-md border border-neutral-100 w-14 h-14 flex items-center justify-center">
                            <img src="/bondy-heart-icon.png" alt="Bondy Logo" className="w-10 h-10 object-contain rounded-full" />
                        </div>
                        <ScanQrCode size={200} className="text-brand-primary mt-4" />
                    </div>
                    <p className="font-bold text-neutral-500 tracking-widest uppercase text-sm">Quét mã để tải nhanh</p>
                </div>
            </div>
        </section>
    );
}

const FAQ = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'technical'>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);



  const tabs = [
    { id: 'general', label: 'Chung' },
    { id: 'privacy', label: 'Bảo mật & An toàn' },
    { id: 'technical', label: 'Kỹ thuật & Cài đặt' }
  ] as const;

  const questions = {
    general: [
      { q: "Bondy khác biệt thế nào với các ứng dụng hẹn hò thông thường?", a: "Thay vì tập trung vào việc vuốt nhanh dựa trên ngoại hình, Bondy tạo ra một \"thánh đường kỹ thuật số\" ưu tiên sự kết nối sâu sắc thông qua sự tương đồng về giá trị sống, sở thích sâu và trạng thái cảm xúc." },
      { q: "Ứng dụng Bondy có miễn phí không?", a: "Bondy hoàn toàn miễn phí khi tải xuống và sử dụng các tính năng cơ bản như ghép đôi, trò chuyện và sử dụng AI Coach cơ bản. Chúng tôi chỉ đề xuất các gói Premium khi bạn muốn mở rộng giới hạn kết nối hoặc dùng các tính năng AI chuyên sâu hơn." },
      { q: "Tính năng AI Coach hoạt động như thế nào? Có thay thế chuyên gia tâm lý không?", a: "AI Coach được xây dựng dựa trên các phương pháp Nhận thức Hành vi (CBT) và Chánh niệm. Trợ lý này đóng vai trò người đồng hành lắng nghe 24/7 và gợi ý các bài tập cân bằng cảm xúc. AI Coach không thay thế cho các liệu trình điều trị hoặc tư vấn từ các bác sĩ tâm lý chuyên nghiệp." }
    ],
    privacy: [
      { q: "Dữ liệu cá nhân của tôi được bảo mật như thế nào trên Bondy?", a: "Mọi thông tin cá nhân và nội dung tin nhắn của bạn được mã hóa an toàn. Bondy cam kết tuyệt đối không bán hoặc chia sẻ dữ liệu của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo." },
      { q: "Làm thế nào để đảm bảo tôi đang trò chuyện với người thật?", a: "Bondy áp dụng hệ thống xác thực tài khoản nghiêm ngặt bằng ảnh tự sướng (Selfie Verification) kết hợp công nghệ AI để đối chiếu. Những tài khoản đã xác thực sẽ nhận được tích xanh uy tín." },
      { q: "Tôi phải làm gì nếu gặp người dùng có hành vi quấy rối hoặc giả mạo?", a: "Bạn có thể nhấn vào nút \"Báo cáo\" (Report) hoặc \"Chặn\" (Block) trực tiếp trong giao diện trò chuyện hoặc trang cá nhân của họ. Đội ngũ kiểm duyệt của Bondy hoạt động 24/7 và sẽ xử lý các báo cáo vi phạm tiêu chuẩn cộng đồng trong vòng tối đa 15 phút." }
    ],
    technical: [
      { q: "Tải file APK cho Android trực tiếp từ website có an toàn không?", a: "Hoàn toàn an toàn. File APK của chúng tôi được phát hành và ký số chính thức bởi đội ngũ phát triển Bondy, đã được quét virus qua các hệ thống kiểm thử bảo mật hàng đầu trước khi đăng tải." },
      { q: "Khi nào Bondy sẽ có phiên bản trên Google Play Store và Apple App Store (iOS)?", a: "Phiên bản chính thức trên Google Play và App Store (iOS) đang trong quá trình phê duyệt cuối cùng và dự kiến sẽ ra mắt trong quý tới. Hiện tại, người dùng Android có thể trải nghiệm sớm thông qua file APK cài đặt nhanh trên website." },
      { q: "Làm thế nào để cập nhật ứng dụng lên phiên bản mới nhất khi cài bằng APK?", a: "Khi có bản cập nhật mới, ứng dụng sẽ gửi thông báo trực tiếp đến bạn. Bạn chỉ cần truy cập lại trang web này để tải bản cài đặt mới nhất ghi đè lên phiên bản cũ mà không lo bị mất dữ liệu tài khoản." }
    ]
  };

  const currentQuestions = questions[activeTab];

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-6">Câu Hỏi Thường Gặp</h2>
      <p className="text-center text-brand-on-surface-variant mb-12 max-w-2xl mx-auto text-editorial leading-relaxed">
        Giải đáp mọi thắc mắc của bạn về cách hoạt động, tính năng an toàn và hướng dẫn cài đặt kỹ thuật của Bondy.
      </p>

      {/* Tabs navigation */}
      <div className="flex justify-center gap-2 p-1.5 bg-brand-surface-container-low border border-brand-outline rounded-full max-w-lg mx-auto mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setOpenIndex(0);
            }}
            className={`flex-1 py-3 px-4 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === tab.id ? 'accent-gradient text-white shadow-sm' : 'text-brand-on-surface-variant hover:text-brand-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {currentQuestions.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-brand-outline-variant/30 overflow-hidden transition-all duration-300">
            <button 
              className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-neutral-50/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="font-bold text-base md:text-lg text-brand-on-surface">{item.q}</span>
              <ChevronDown className={`transition-transform duration-300 text-brand-primary shrink-0 ml-4 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6 text-brand-on-surface-variant leading-relaxed text-editorial border-t border-brand-outline-variant/30 pt-4 text-sm md:text-base">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Additional Help CTA */}
      <div className="mt-16 bg-brand-surface-container-low border border-brand-outline rounded-3xl p-8 max-w-3xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -ml-16 -mt-16"></div>
        <h4 className="font-bold text-lg mb-2 relative z-10 text-brand-on-surface">Bạn vẫn còn thắc mắc khác?</h4>
        <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-6 relative z-10 leading-relaxed">
          Đừng ngần ngại liên hệ trực tiếp với chúng tôi để được giải đáp nhanh chóng 24/7.
        </p>
        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          <a href="mailto:support@bondy.chat" className="bg-white border border-brand-outline hover:border-brand-primary/30 text-brand-on-surface text-xs font-bold py-3 px-6 rounded-full transition-colors">
            support@bondy.chat
          </a>
          <a href="#" className="accent-gradient text-white text-xs font-bold py-3 px-6 rounded-full hover:shadow-md transition-all">
            Nhắn tin qua Fanpage
          </a>
        </div>
      </div>
    </section>
  );
}

const Footer = () => {
    return (
        <footer className="py-16 border-t border-brand-outline-variant/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <a 
                        href="#" 
                        onClick={scrollToTopSmooth}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img src="/bondy-heart-icon.png" alt="Bondy Logo" className="h-9 w-9 object-contain rounded-full bg-white p-0.5 border border-brand-outline-variant/30 shadow-sm" />
                        <span className="font-display font-bold text-2xl text-brand-primary">Bondy</span>
                    </a>
                    <nav className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-brand-on-surface-variant">
                        <a href="#" className="hover:text-brand-primary transition-colors">Điều khoản dịch vụ</a>
                        <a href="#" className="hover:text-brand-primary transition-colors">Chính sách bảo mật</a>
                        <a href="#" className="hover:text-brand-primary transition-colors">Liên hệ</a>
                        <a href="#" className="hover:text-brand-primary transition-colors">Trung tâm hỗ trợ</a>
                    </nav>
                </div>
                <div className="text-center text-sm text-brand-on-surface-alpha opacity-60">
                    © 2024 Bondy - Thánh đường Kỹ thuật số. Bảo lưu mọi quyền.
                </div>
            </div>
        </footer>
    );
}

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => scrollToTopSmooth(e)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full frosted-glass shadow-sanctuary text-brand-primary cursor-pointer hover:bg-brand-primary/10 transition-colors flex items-center justify-center"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp size={24} className="stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="vibrant-blob w-[400px] h-[400px] bg-brand-primary -top-[100px] -right-[100px]"></div>
      <div className="vibrant-blob w-[300px] h-[300px] bg-brand-secondary -bottom-[50px] -left-[50px]"></div>
      
      <Navbar />
      <Hero />
      <SmartMatching />
      <AICoach />
      <HealingSpace />
      <LoveSpace />
      <BentoFeatures />
      <Security />
      <DownloadSection />
      <FAQ />
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

