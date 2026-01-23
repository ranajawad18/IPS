
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from './constants';
import { startChat } from './services/geminiService';
import { Message } from './types';

// Scroll Reveal Component for smooth entrance animations
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${isVisible ? 'active' : ''} ${className}`}>
      {children}
    </div>
  );
};

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 sm:py-6 flex justify-between items-center text-left group transition-all"
      >
        <span className="text-sm sm:text-lg lg:text-xl font-[1000] text-brandBlue dark:text-white group-hover:text-brandOrange transition-colors uppercase tracking-tight pr-4">
          {question}
        </span>
        <span className={`text-xl transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-45 text-brandOrange' : 'text-brandBlue dark:text-gray-500'}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'about' | 'teachers' | 'classes' | 'syllabus' | 'contact'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Assalamu Alaikum! I'm your IPS Assistant. How can I help you today?", timestamp: Date.now() }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);
    try {
      const chat = startChat("You are IPS assistant. Be professional, friendly, and helpful about Iqra Public School Gogera Campus.");
      const result = await chat.sendMessage({ message: userInput });
      const now = Date.now();
      setChatMessages(prev => [...prev, { 
        id: now.toString(), 
        role: 'model', 
        content: result.text || "I'm having a connection issue.", 
        timestamp: now 
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const navLinks = [
    { name: 'Home', action: () => setView('home') },
    { name: 'About', action: () => setView('about') },
    { name: 'Teachers', action: () => setView('teachers') },
    { name: 'Classes', action: () => setView('classes') },
    { name: 'Syllabus', action: () => setView('syllabus') },
    { name: 'Contact', action: () => setView('contact') }
  ];

  const handleNavLinkClick = (link: any) => {
    if (link.action) {
      link.action();
    }
    setIsMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-brandOrange selection:text-white overflow-x-hidden w-full relative">
      
      {/* Navigation - Fixed Position to ensure it stays at top */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 dark:bg-darkBg/95 backdrop-blur-md z-[70] border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 sm:h-20 lg:h-24">
          <div className="flex items-center space-x-2 sm:space-x-4 cursor-pointer min-w-0" onClick={() => setView('home')}>
            <ICONS.ShellyLogo className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex-shrink-0" />
            <div className="leading-none min-w-0 flex flex-col justify-center">
              <span className="text-[13px] sm:text-xl lg:text-3xl font-[1000] text-brandBlue dark:text-white block tracking-tighter uppercase truncate">IQRA PUBLIC</span>
              <span className="text-[6px] sm:text-[9px] lg:text-[11px] uppercase tracking-wider font-black text-brandOrange whitespace-nowrap">Gogera Campus</span>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center space-x-8 text-[11px] font-[1000] uppercase tracking-widest flex-shrink-0">
            {navLinks.map(link => (
              <button 
                key={link.name} 
                onClick={() => handleNavLinkClick(link)} 
                className={`transition-colors py-2 ${
                  (view === link.name.toLowerCase()) || (view === 'home' && link.name === 'Home')
                  ? 'text-brandOrange underline underline-offset-8 decoration-4' 
                  : 'text-brandBlue dark:text-gray-300 hover:text-brandOrange'}`}
              >
                {link.name}
              </button>
            ))}
            <button onClick={toggleDarkMode} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
               {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>

          <div className="flex xl:hidden items-center space-x-1">
            <button onClick={toggleDarkMode} className="p-2 text-xl text-brandBlue dark:text-gray-400">{isDarkMode ? '🌞' : '🌙'}</button>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-brandBlue dark:text-white" aria-label="Open Menu">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h12m-12 6h16"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16 sm:h-20 lg:h-24"></div>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
         <div className={`absolute top-0 right-0 w-[85%] max-sm h-full bg-white dark:bg-darkBg transition-transform duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl flex flex-col`}>
            <div className="flex items-center justify-between px-6 h-16 sm:h-20 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-darkBg">
              <div className="flex items-center space-x-3">
                 <ICONS.ShellyLogo className="w-8 h-8 flex-shrink-0" />
                 <span className="font-black text-brandBlue dark:text-white uppercase tracking-tighter text-[14px]">IPS GOGERA</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-brandBlue dark:text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2">
               {navLinks.map((link) => (
                 <button key={link.name} onClick={() => handleNavLinkClick(link)} className={`block w-full py-4 text-left text-3xl font-[1000] uppercase tracking-tighter transition-all border-b border-gray-50 dark:border-gray-800 last:border-0 ${((view === 'home' && link.name === 'Home') || (view === link.name.toLowerCase())) ? 'text-brandOrange' : 'text-brandBlue dark:text-white'}`}>{link.name}</button>
               ))}
            </div>
         </div>
      </div>

      {/* VIEW RENDERER */}
      <main className="animate-fade-up">
        {view === 'home' && (
          <>
            {/* HOME HERO SECTION */}
            <section id="home" className="relative h-[80vh] sm:h-[90vh] lg:h-screen flex items-center bg-brandBlue overflow-hidden">
              <div className="absolute inset-0 z-0">
                <video autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600" className="w-full h-full object-cover scale-105">
                  <source src="/assets/Vedio.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-brandBlue/80 via-brandBlue/40 to-brandBlue/90"></div>
              </div>
              <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
                <ScrollReveal className="space-y-6 sm:space-y-12">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black rounded-full text-[10px] sm:text-xs uppercase tracking-[0.3em] animate-fade-up">
                    <span className="w-2 h-2 rounded-full bg-brandOrange animate-pulse"></span>
                    <span>Admissions Open 2025-26</span>
                  </div>
                  <h1 className="text-5xl sm:text-8xl lg:text-[11rem] font-[1000] text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                    Think <span className="text-brandOrange">Better.</span> <br /> 
                    Grow <span className="text-brandOrange">Higher.</span>
                  </h1>
                  <p className="text-white text-[14px] sm:text-2xl lg:text-4xl max-w-3xl font-bold leading-tight opacity-90 drop-shadow-lg">
                    Blending Silicon Valley digital expertise with timeless moral character. Gogera's hub for future leaders.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-10">
                    <button className="group relative w-full sm:w-auto overflow-hidden bg-brandOrange text-white font-[1000] px-10 py-5 sm:px-16 sm:py-8 rounded-full uppercase text-[10px] sm:text-sm tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-brandOrange hover:border-white">
                       <span className="relative z-10 transition-colors duration-500 group-hover:text-brandBlue">Join the Campus</span>
                       <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                    <button onClick={() => setView('about')} className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 sm:px-16 sm:py-8 rounded-full font-[1000] uppercase text-[10px] sm:text-sm tracking-widest text-center transition-all hover:bg-white/20">Explore Our Legacy</button>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* DIRECTORS VISION */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
                  <ScrollReveal className="w-full lg:w-1/2">
                    <div className="relative group">
                       <div className="absolute inset-0 bg-brandOrange rounded-[80px] rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                       <div className="relative aspect-[4/5] rounded-[80px] overflow-hidden shadow-3xl border-8 border-white dark:border-gray-800 -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                          <img src="/assets/director.jpeg" className="w-full h-full object-cover" alt="Director Vision" />
                          <div className="absolute inset-0 bg-gradient-to-t from-brandBlue/80 to-transparent"></div>
                          <div className="absolute bottom-10 left-10 text-white">
                             <h4 className="text-3xl font-[1000] uppercase tracking-tighter">Institution Director</h4>
                             <p className="text-brandOrange font-black uppercase tracking-widest text-xs mt-1">Haroon Jameel</p>
                          </div>
                       </div>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal className="w-full lg:w-1/2 space-y-8">
                     <h6 className="text-brandOrange font-black uppercase tracking-widest text-xs">A New Era of Learning</h6>
                     <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter leading-none uppercase">Crafting <span className="text-brandOrange">Visionaries,</span> Not Just Students.</h2>
                     <p className="text-gray-600 dark:text-gray-400 font-bold text-lg sm:text-xl leading-relaxed">
                        "In the 21st century, the classroom must be a lab for innovation. At IPS Gogera, we build the future. Our vision is to produce graduates who are technically superior and morally grounded."
                     </p>
                  </ScrollReveal>
               </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-20 bg-brandBlue dark:bg-black">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
                  {[
                    { label: 'Years of Trust', val: '5+' },
                    { label: 'Leaders Mentored', val: '2.5k' },
                    { label: 'Master Mentors', val: '45+' },
                    { label: 'AI Classrooms', val: '100%' }
                  ].map((stat, i) => (
                    <ScrollReveal key={i} className="text-center group p-8 rounded-[40px] border border-white/5 hover:bg-white/5 transition-all">
                       <div className="text-4xl sm:text-7xl font-[1000] text-white mb-2 group-hover:text-brandOrange transition-all duration-500">{stat.val}</div>
                       <div className="text-[10px] sm:text-xs uppercase font-black tracking-[0.3em] text-white/40">{stat.label}</div>
                    </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* CAMPUS LIFE GALLERY */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-20">
                     <h2 className="text-3xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase">Campus <span className="text-brandOrange">Life.</span></h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 h-[600px] sm:h-[800px]">
                     <div className="col-span-2 row-span-2 rounded-[50px] overflow-hidden group relative">
                        <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 1" />
                        <div className="absolute inset-0 bg-brandBlue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white font-[1000] uppercase tracking-widest text-xl">Interactive Learning</span>
                        </div>
                     </div>
                     <div className="rounded-[40px] overflow-hidden group relative">
                        <img src="/assets/gallery5.jpeg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 2" />
                     </div>
                     <div className="rounded-[40px] overflow-hidden group relative">
                        <img src="/assets/gallery4.jpeg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 3" />
                     </div>
                     <div className="col-span-2 rounded-[40px] overflow-hidden group relative">
                        <img src="/assets/gallery1.jpeg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 4" />
                     </div>
                  </div>
               </div>
            </section>

            {/* FACILITIES SECTION */}
            <section className="py-24 sm:py-32 bg-brandLightBlue dark:bg-black/20">
               <div className="max-w-7xl mx-auto px-6 text-center">
                  <h2 className="text-3xl sm:text-6xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase mb-20">World Class <span className="text-brandOrange">Facilities.</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
                     {[
                       { title: 'Secure Environment', icon: '🛡️', desc: '24/7 CCTV surveillance and verified security staff.' },
                       { title: 'Innovation Labs', icon: '💻', desc: 'A rich environment for digital tinkering and coding.' },
                       { title: 'Sports Arena', icon: '⚽', desc: 'Large activity grounds for physical well-being.' },
                       { title: 'Smart Learning', icon: '📽️', desc: 'Digital projectors and interactive pedagogy in every room.' },
                       { title: 'RO Clean Water', icon: '💧', desc: 'High-quality hydration systems for all students.' },
                       { title: 'Moral Workshops', icon: '🕋', desc: 'Dedicated sessions for character and spiritual growth.' }
                     ].map((fac, i) => (
                       <ScrollReveal key={i} className="p-12 bg-white dark:bg-gray-800 rounded-[50px] shadow-sm hover:shadow-2xl transition-all border border-transparent hover:border-brandOrange group">
                          <div className="text-7xl mb-10 group-hover:scale-110 transition-transform">{fac.icon}</div>
                          <h4 className="text-2xl font-black text-brandBlue dark:text-white uppercase tracking-tighter mb-4">{fac.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{fac.desc}</p>
                       </ScrollReveal>
                     ))}
                  </div>
               </div>
            </section>

            {/* TESTIMONIALS & FAQ */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <ScrollReveal>
                     <h2 className="text-3xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase mb-8 leading-none">Trust of <span className="text-brandOrange">Parents.</span></h2>
                     <div className="p-12 rounded-[60px] bg-brandBlue text-white shadow-3xl">
                        <p className="text-2xl font-bold leading-relaxed mb-10 italic">"I have seen my children flourish into confident individuals. IPS is more than a school; it's a mentorship hub."</p>
                        <h5 className="font-black uppercase tracking-widest text-sm">Munir Ahmed, Parent</h5>
                     </div>
                  </ScrollReveal>
                  <ScrollReveal className="space-y-6">
                     <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[50px] p-10 border border-gray-100 dark:border-gray-800">
                        <FAQItem question="Why choose IPS Gogera?" answer="We offer a balanced mix of Oxford curriculum and digital literacy." />
                        <FAQItem question="What is the student-teacher ratio?" answer="We maintain a maximum of 25 students per class for personalized attention." />
                        <FAQItem question="Is there any financial support?" answer="We offer merit-based and need-based scholarships." />
                     </div>
                  </ScrollReveal>
               </div>
            </section>
          </>
        )}

        {view === 'about' && (
          <div className="animate-fade-up">
            {/* ABOUT HERO */}
            <section className="relative h-[60vh] sm:h-[80vh] flex items-center bg-brandBlue overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600" className="w-full h-full object-cover opacity-20 scale-105" alt="Heritage" />
                <div className="absolute inset-0 bg-gradient-to-b from-brandBlue/90 via-brandBlue/60 to-brandBlue"></div>
              </div>
              <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
                <ScrollReveal className="space-y-6">
                  <div className="inline-block px-5 py-2.5 bg-brandOrange text-white font-[1000] rounded-full text-[10px] uppercase tracking-[0.4em] shadow-2xl">Established 2009</div>
                  <h1 className="text-6xl sm:text-9xl lg:text-[11rem] font-[1000] text-white tracking-tighter uppercase mb-6 leading-none">Our <span className="text-brandOrange">Heritage.</span></h1>
                  <p className="text-white/80 text-sm sm:text-2xl max-w-4xl mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed">Defining Educational Excellence for Over a Decade in Gogera.</p>
                </ScrollReveal>
              </div>
            </section>

            {/* GENESIS STORY */}
            <section className="py-24 sm:py-40 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  <ScrollReveal className="space-y-10">
                     <div className="inline-block w-12 h-1.5 bg-brandOrange"></div>
                     <h2 className="text-5xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase leading-[0.9]">From a Dream to a <span className="text-brandOrange">Landmark.</span></h2>
                     <p className="text-gray-600 dark:text-gray-400 font-bold text-lg leading-relaxed">Founded in 2009, we started with a mission to bring urban-quality education to the rural heart of Okara. Today, we are Gogera's premier campus with world-class tech facilities.</p>
                  </ScrollReveal>
                  <ScrollReveal>
                     <div className="aspect-square rounded-[60px] overflow-hidden shadow-3xl border-4 border-white dark:border-gray-800">
                        <img src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 hover:grayscale-0" alt="Founding" />
                     </div>
                  </ScrollReveal>
               </div>
            </section>

            {/* MISSION / VISION */}
            <section className="py-24 bg-gray-50 dark:bg-black/20">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <ScrollReveal className="p-16 sm:p-24 bg-brandBlue text-white rounded-[100px] shadow-2xl relative overflow-hidden group">
                     <h3 className="text-5xl font-black uppercase tracking-tighter mb-10 text-brandOrange">Mission.</h3>
                     <p className="text-xl sm:text-2xl font-bold leading-relaxed opacity-80">To empower students with digital literacy and timeless moral character through innovation.</p>
                  </ScrollReveal>
                  <ScrollReveal className="p-16 sm:p-24 bg-brandOrange text-white rounded-[100px] shadow-2xl relative overflow-hidden group lg:mt-24">
                     <h3 className="text-5xl font-black uppercase tracking-tighter mb-10 text-brandBlue">Vision.</h3>
                     <p className="text-xl sm:text-2xl font-bold leading-relaxed opacity-80">To be the gold standard in regional education, producing world-ready visionaries.</p>
                  </ScrollReveal>
               </div>
            </section>

            {/* LEADERSHIP DUO */}
            <section className="py-24 sm:py-40 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-24">
                     <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase">Visionary <span className="text-brandOrange">Leadership.</span></h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                     <ScrollReveal className="p-12 bg-gray-50 dark:bg-gray-800 rounded-[80px]">
                        <div className="flex items-center space-x-8 mb-8">
                           <img src="/assets/director.jpeg" className="w-24 h-24 rounded-3xl object-cover" alt="Director" />
                           <div>
                              <h4 className="text-2xl font-black text-brandBlue dark:text-white uppercase">Haroon Jameel</h4>
                              <p className="text-brandOrange font-black uppercase text-[10px]">Institute Director</p>
                           </div>
                        </div>
                        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">"We are building a legacy of excellence for every family in Okara, focusing on future-proof skills."</p>
                     </ScrollReveal>
                     <ScrollReveal className="p-12 bg-brandBlue text-white rounded-[80px] lg:translate-y-12">
                        <div className="flex items-center space-x-8 mb-8">
                           <img src="/assets/ico11.jpeg" className="w-24 h-24 rounded-3xl object-cover" alt="Principal" />
                           <div>
                              <h4 className="text-2xl font-black uppercase text-white">Bilal Jameel</h4>
                              <p className="text-brandOrange font-black uppercase text-[10px]">Principal</p>
                           </div>
                        </div>
                        <p className="text-lg font-bold opacity-80 italic">"Classroom excellence and student safety are our daily missions to prepare them for global races."</p>
                     </ScrollReveal>
                  </div>
               </div>
            </section>

            {/* MILESTONE TIMELINE */}
            <section className="py-24 sm:py-40 bg-white dark:bg-darkBg">
               <div className="max-w-4xl mx-auto px-6">
                  <div className="text-center mb-24">
                     <h2 className="text-3xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase">Our <span className="text-brandOrange">Milestones.</span></h2>
                  </div>
                  <div className="relative border-l-4 border-brandBlue/10 space-y-20 ml-6 sm:ml-20">
                     {[
                        { year: '2022', title: 'The First Brick', desc: 'IPS Gogera opened its doors to serve the local community.' },
                        { year: '2023', title: 'IT Wing', desc: 'Integrated high-speed labs and digital learning tools.' },
                        { year: '2024', title: 'Oxford Standard', desc: 'Adopted Oxford curriculum across all grades.' },
                        { year: '2025', title: 'AI Launch', desc: 'Full AI & Coding integration for all primary levels.' }
                     ].map((item, idx) => (
                        <ScrollReveal key={idx} className="relative pl-12 group">
                           <div className="absolute top-0 -left-[14px] w-6 h-6 bg-white dark:bg-darkBg border-4 border-brandBlue group-hover:border-brandOrange rounded-full transition-colors"></div>
                           <div className="absolute top-0 -left-[60px] text-xl font-black text-brandBlue dark:text-white opacity-40">{item.year}</div>
                           <h4 className="text-2xl font-black text-brandBlue dark:text-white uppercase mb-2">{item.title}</h4>
                           <p className="text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                        </ScrollReveal>
                     ))}
                  </div>
               </div>
            </section>
          </div>
        )}

        {view === 'teachers' && (
          <div className="animate-fade-up">
            {/* TEACHERS HERO */}
            <section className="relative h-[60vh] sm:h-[75vh] flex items-center bg-[#064e3b] overflow-hidden">
               <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600" className="w-full h-full object-cover opacity-30 scale-110" alt="Faculty" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#064e3b]/80 via-transparent to-[#064e3b]"></div>
               </div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center lg:text-left">
                  <ScrollReveal className="space-y-6">
                     <h1 className="text-5xl sm:text-9xl font-[1000] text-white tracking-tighter uppercase leading-none">The <span className="text-brandOrange">Masters.</span></h1>
                     <p className="text-white/80 text-sm sm:text-2xl max-w-2xl font-bold uppercase tracking-widest leading-relaxed">Highly qualified educators shaping the future of Gogera.</p>
                  </ScrollReveal>
               </div>
            </section>

            {/* SPOTLIGHT */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg overflow-hidden">
               <div className="max-w-7xl mx-auto px-6">
                  <ScrollReveal className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[80px] p-10 sm:p-20 flex flex-col lg:flex-row items-center gap-16 border-2 border-emerald-100 dark:border-emerald-800/30">
                     <div className="w-full lg:w-2/5 relative">
                        <div className="absolute inset-0 bg-brandOrange rounded-[60px] translate-x-4 translate-y-4"></div>
                        <img src=" /assets/director.jpeg" className="relative aspect-[3/4] rounded-[60px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 object-cover" alt="Spotlight" />
                        <div className="absolute top-6 right-6 bg-brandOrange text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">Institution Director</div>
                     </div>
                     <div className="w-full lg:w-3/5 space-y-8">
                        <h2 className="text-4xl sm:text-6xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase">Leading through <span className="text-brandOrange">Excellence.</span></h2>
                        <h4 className="text-3xl font-black text-brandBlue dark:text-white">Director Haroon Jameel</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs">Primary Wing Head | 12+ Years Experience</p>
                        <p className="text-gray-600 dark:text-gray-400 font-bold text-lg leading-relaxed italic">"Teaching is a sacred trust. Our goal at IPS is to empower every child to grow into their best version."</p>
                     </div>
                  </ScrollReveal>
               </div>
            </section>

            {/* FACULTY GRID */}
            <section className="py-24 sm:py-32 bg-gray-50 dark:bg-black/20">
               <div className="max-w-7xl mx-auto px-6 text-center">
                  <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase mb-24">The <span className="text-brandOrange">Faculty</span> Core.</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                     {[
                        { name: 'Miss Iqra', sub: 'IT Head studies head', img: '/assets/img7.jpeg', icon: '💻' },
                        { name: 'Miss Azrha', sub: 'Science studies head', img: '/assets/img8.jpeg', icon: '🧪' },
                        { name: 'Mr. Taswar', sub: 'English studies head', img: '/assets/img10.jpeg', icon: '📚' },
                        { name: 'Miss Areesha', sub: 'Islamic studies head', img: '/assets/img9.jpeg', icon: '🕌' }
                     ].map((t, i) => (
                        <ScrollReveal key={i} className="group text-center">
                           <div className="relative mb-6">
                              <div className="absolute inset-0 bg-brandBlue rounded-[40px] group-hover:rotate-6 transition-transform"></div>
                              <img src={t.img} className="relative aspect-[3/4] rounded-[40px] w-full object-cover shadow-lg border-4 border-white dark:border-gray-800" alt={t.name} />
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-2 rounded-2xl shadow-xl flex items-center space-x-2">
                                 <span className="text-xl">{t.icon}</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-brandBlue dark:text-white whitespace-nowrap">{t.sub}</span>
                              </div>
                           </div>
                           <h4 className="text-xl font-black text-brandBlue dark:text-white uppercase mt-8">{t.name}</h4>
                        </ScrollReveal>
                     ))}
                  </div>
               </div>
            </section>
          </div>
        )}

        {view === 'classes' && (
          <div className="animate-fade-up">
            {/* CLASSES HERO */}
            <section className="relative h-[60vh] sm:h-[80vh] flex items-center bg-brandBlue overflow-hidden">
               <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600" className="w-full h-full object-cover opacity-30 scale-105" alt="Academic Wings" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-brandBlue/90 via-brandBlue/40 to-brandOrange/20"></div>
               </div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
                  <ScrollReveal className="space-y-6">
                     <div className="inline-block px-5 py-2.5 bg-brandOrange text-white font-black rounded-full text-[10px] uppercase tracking-[0.4em] shadow-xl">Academic Pathway</div>
                     <h1 className="text-5xl sm:text-9xl font-[1000] text-white tracking-tighter uppercase leading-none">Learning <span className="text-brandOrange">Wings.</span></h1>
                     <p className="text-white/80 text-sm sm:text-2xl max-w-3xl mx-auto font-bold uppercase tracking-widest leading-relaxed">Standardized environments designed for age-appropriate character growth.</p>
                  </ScrollReveal>
               </div>
            </section>

            {/* THE IPS METHOD */}
            <section className="py-24 bg-white dark:bg-darkBg">
               <div className="max-w-5xl mx-auto px-6 text-center">
                  <h2 className="text-3xl sm:text-6xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase mb-12">The <span className="text-brandOrange">IPS Method.</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     {[
                        { title: 'Play.', icon: '🎲', desc: 'Developing motor skills and creative curiosity through play-based discovery.' },
                        { title: 'Inquire.', icon: '💡', desc: 'Analytical thinking, questioning, and problem solving in every science lab.' },
                        { title: 'Lead.', icon: '👑', desc: 'Confidence, public speaking, ethics, and digital skills for the 21st century.' }
                     ].map((item, i) => (
                        <div key={i} className="p-10 bg-gray-50 dark:bg-gray-800 rounded-[50px] transition-transform hover:scale-105 border border-transparent hover:border-brandOrange">
                           <div className="text-6xl mb-6">{item.icon}</div>
                           <h4 className="text-2xl font-black text-brandBlue dark:text-white uppercase mb-2">{item.title}</h4>
                           <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* WING SECTIONS - DETAILED */}
            <section className="py-20 sm:py-32 bg-gray-50 dark:bg-black/20">
               <div className="max-w-7xl mx-auto px-6 space-y-32">
                  {[
                    { 
                      name: 'Montessori Magic', 
                      age: 'Ages 3-5',
                      desc: 'Our Early Childhood Development wing follows a world-class play-based approach. We focus on sensory integration, social grace, and basic literacy in a colorful, safe environment.', 
                      color: 'border-blue-500', 
                      img: '/assets/gallery1.jpeg',
                      highlights: ['Sensory Play', 'Social Grace', 'Oral Skills', 'Moral Stories']
                    },
                    { 
                      name: 'Foundation Core', 
                      age: 'Grades 1-5',
                      desc: 'The Primary Wing utilizes the Oxford Progressive series. We prioritize a deep conceptual understanding of Math and English, alongside strong character-building workshops.', 
                      color: 'border-brandOrange', 
                      img: '/assets/gallery4.jpeg',
                      highlights: ['Conceptual Math', 'Oxford English', 'Sabaq Urdu', 'Digital Basics']
                    },
                    { 
                      name: 'Leadership Hub', 
                      age: 'Grades 6-8',
                      desc: 'Middle School is where students transition to leaders. Our STEM focus, advanced digital labs, and public speaking modules prepare them for high-school success.', 
                      color: 'border-brandBlue', 
                      img: '/assets/gallery5.jpeg',
                      highlights: ['Advanced IT', 'Science Labs', 'Civic Ethics', 'Career Mentoring']
                    }
                  ].map((c, i) => (
                    <ScrollReveal key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
                       <div className="w-full lg:w-1/2 relative">
                          <div className={`absolute inset-0 translate-x-4 translate-y-4 rounded-[60px] opacity-10 bg-brandBlue`}></div>
                          <img src={c.img} className="relative w-full aspect-video lg:aspect-square object-cover rounded-[60px] shadow-3xl border-4 border-white dark:border-gray-800" alt={c.name} />
                       </div>
                       <div className="w-full lg:w-1/2 space-y-8">
                          <div className="space-y-2">
                             <h4 className="text-brandOrange font-black uppercase text-xs tracking-widest">{c.age}</h4>
                             <h2 className={`text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white uppercase leading-none`}>{c.name}</h2>
                          </div>
                          <p className="text-lg text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{c.desc}</p>
                          <div className="grid grid-cols-2 gap-4">
                             {c.highlights.map((h, idx) => (
                                <div key={idx} className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                   <ICONS.Verified className="w-4 h-4 text-brandOrange" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-brandBlue dark:text-gray-300">{h}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* LEARNING ENVIRONMENT GALLERY */}
            <section className="py-24 bg-white dark:bg-darkBg overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <ScrollReveal className="space-y-8">
                     <h2 className="text-4xl sm:text-6xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase leading-none">Designed for <span className="text-brandOrange">Focus.</span></h2>
                     <p className="text-lg font-bold text-gray-500 dark:text-gray-400 leading-relaxed">Our classrooms are ergonomic learning spaces. From high-quality lighting to interactive digital touchpoints, every inch of the Gogera Campus is optimized for focus and success.</p>
                     <div className="flex items-center space-x-6">
                        <div className="text-center">
                           <div className="text-3xl font-black text-brandOrange">25</div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Students</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="text-center">
                           <div className="text-3xl font-black text-brandOrange">100%</div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Smart Boards</p>
                        </div>
                     </div>
                  </ScrollReveal>
                  <ScrollReveal className="grid grid-cols-2 gap-4">
                     <img src="/assets/footer1.jpeg" className="rounded-3xl shadow-lg hover:scale-105 transition-transform" alt="Environment 1" />
                     <img src="/assets/img3.jpeg" className="rounded-3xl shadow-lg translate-y-8 hover:scale-105 transition-transform" alt="Environment 2" />
                  </ScrollReveal>
               </div>
            </section>
          </div>
        )}

        {view === 'syllabus' && (
          <div className="animate-fade-up">
            {/* SYLLABUS HERO */}
            <section className="relative h-[60vh] sm:h-[80vh] flex items-center bg-brandBlue overflow-hidden">
               <div className="absolute inset-0 z-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(#ff7e21_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
                  <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600" className="w-full h-full object-cover" alt="Curriculum Background" />
               </div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
                  <ScrollReveal className="space-y-8">
                     <div className="inline-block px-6 py-2 bg-brandOrange/20 backdrop-blur-md border border-brandOrange/30 text-brandOrange font-black rounded-full text-[10px] uppercase tracking-[0.5em]">The Blue Print</div>
                     <h1 className="text-5xl sm:text-9xl font-[1000] text-white tracking-tighter uppercase leading-none">Global <span className="text-brandOrange">Syllabus.</span></h1>
                     <p className="text-white/70 text-sm sm:text-2xl max-w-4xl mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed">Where National Values meet Oxford Excellence.</p>
                  </ScrollReveal>
               </div>
            </section>

            {/* OXFORD INTEGRATION */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <ScrollReveal className="order-2 lg:order-1">
                     <div className="relative group">
                        <div className="absolute inset-0 bg-brandBlue rounded-[50px] rotate-3 opacity-10"></div>
                        <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800" className="relative rounded-[50px] shadow-3xl border-2 border-gray-100 dark:border-gray-800" alt="Oxford Standards" />
                     </div>
                  </ScrollReveal>
                  <ScrollReveal className="space-y-10 order-1 lg:order-2">
                     <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase leading-none">The <span className="text-brandOrange">Oxford</span> Standard.</h2>
                     <p className="text-lg font-bold text-gray-500 dark:text-gray-400 leading-relaxed">We strictly adhere to the Oxford University Press (OUP) curriculum guidelines for English and Mathematics, ensuring our students can compete on a global scale while maintaining their local cultural identity.</p>
                     <div className="flex flex-wrap gap-4">
                        {['Progressive English', 'New Countdown Math', 'Sabaq Urdu', 'Cambridge Science'].map((tag, i) => (
                          <span key={i} className="px-6 py-3 bg-brandLightBlue dark:bg-gray-800 rounded-full text-[10px] font-black uppercase text-brandBlue dark:text-brandOrange tracking-widest">{tag}</span>
                        ))}
                     </div>
                  </ScrollReveal>
               </div>
            </section>

            {/* DETAILED TRACKS */}
            <section className="py-24 bg-gray-50 dark:bg-black/20">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-24">
                     <h2 className="text-3xl sm:text-6xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase">Academic <span className="text-brandOrange">Tracks.</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     {[
                        { 
                          title: 'Primary Core (1-5)', 
                          color: 'text-brandBlue',
                          subjects: ['Oxford Progressive English', 'Sabaq Urdu Series', 'New Countdown Math', 'General Science', 'Islamiat & Nazra', 'Social Studies']
                        },
                        { 
                          title: 'Middle Science (6-8)', 
                          color: 'text-brandOrange',
                          subjects: ['Cambridge Physics', 'Cambridge Chemistry', 'Cambridge Biology', 'Advanced Algebra', 'Geography & History', 'English Literature']
                        },
                        { 
                          title: 'Digital Frontier', 
                          color: 'text-emerald-500',
                          subjects: ['Visual Block Coding', 'Graphic Design (Canva)', 'Basic Web Structure', 'Hardware Essentials', 'MS Office Suite', 'Cyber Ethics']
                        }
                     ].map((track, i) => (
                        <ScrollReveal key={i} className="bg-white dark:bg-gray-800 p-12 rounded-[60px] shadow-xl border border-transparent hover:border-brandOrange transition-all group">
                           <h4 className={`text-2xl font-black ${track.color} uppercase mb-8 pb-4 border-b border-gray-100 dark:border-gray-700`}>{track.title}</h4>
                           <ul className="space-y-4">
                              {track.subjects.map((sub, idx) => (
                                 <li key={idx} className="flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brandOrange"></div>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{sub}</span>
                                 </li>
                              ))}
                           </ul>
                        </ScrollReveal>
                     ))}
                  </div>
               </div>
            </section>

            {/* ASSESSMENT FRAMEWORK */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
                  <ScrollReveal className="w-full lg:w-1/2 space-y-10">
                     <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase leading-none">Performance <span className="text-brandOrange">Metrix.</span></h2>
                     <p className="text-lg font-bold text-gray-500 dark:text-gray-400 leading-relaxed">Evaluation at IPS Gogera is not just about final exams. We believe in a holistic grading system that rewards effort, character, and practical application.</p>
                     <div className="space-y-6">
                        {[
                           { label: 'Continuous Evaluation', percent: '40%' },
                           { label: 'Terminal Examinations', percent: '40%' },
                           { label: 'Character & Ethics', percent: '20%' }
                        ].map((m, idx) => (
                           <div key={idx} className="space-y-2 group">
                              <div className="flex justify-between font-black uppercase text-[10px] tracking-[0.2em]">
                                 <span>{m.label}</span>
                                 <span className="text-brandOrange">{m.percent}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-brandBlue group-hover:bg-brandOrange transition-all duration-500" style={{ width: m.percent }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </ScrollReveal>
                  <ScrollReveal className="w-full lg:w-1/2">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-brandLightBlue dark:bg-gray-800 rounded-[40px] flex flex-col items-center justify-center p-10 text-center shadow-inner">
                           <div className="text-5xl mb-4">📝</div>
                           <h5 className="font-black text-brandBlue dark:text-white uppercase tracking-tighter">Project Reports</h5>
                        </div>
                        <div className="aspect-square bg-orange-50 dark:bg-brandOrange/10 rounded-[40px] flex flex-col items-center justify-center p-10 text-center translate-y-8">
                           <div className="text-5xl mb-4">🎤</div>
                           <h5 className="font-black text-brandOrange uppercase tracking-tighter">Oral Vivas</h5>
                        </div>
                        <div className="aspect-square bg-emerald-50 dark:bg-emerald-900/10 rounded-[40px] flex flex-col items-center justify-center p-10 text-center">
                           <div className="text-5xl mb-4">🏆</div>
                           <h5 className="font-black text-emerald-600 uppercase tracking-tighter">Co-Curricular</h5>
                        </div>
                        <div className="aspect-square bg-blue-50 dark:bg-blue-900/10 rounded-[40px] flex flex-col items-center justify-center p-10 text-center translate-y-8">
                           <div className="text-5xl mb-4">📚</div>
                           <h5 className="font-black text-blue-600 uppercase tracking-tighter">Monthly Tests</h5>
                        </div>
                     </div>
                  </ScrollReveal>
               </div>
            </section>
          </div>
        )}

        {view === 'contact' && (
          <div className="animate-fade-up">
            {/* CONTACT HERO */}
            <section className="relative h-[50vh] sm:h-[70vh] flex items-center bg-brandBlue overflow-hidden">
               <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600" className="w-full h-full object-cover opacity-30" alt="Contact Us" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brandBlue via-brandBlue/40 to-transparent"></div>
               </div>
               <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
                  <ScrollReveal className="space-y-6">
                     <div className="inline-block px-5 py-2 bg-brandOrange text-white font-black rounded-full text-[10px] uppercase tracking-[0.5em] shadow-xl">Stay Connected</div>
                     <h1 className="text-5xl sm:text-9xl font-[1000] text-white tracking-tighter uppercase leading-none">Get In <span className="text-brandOrange">Touch.</span></h1>
                     <p className="text-white/70 text-sm sm:text-2xl max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">Reach out for admissions, inquiries, or feedback.</p>
                  </ScrollReveal>
               </div>
            </section>

            {/* CONTACT CONTENT */}
            <section className="py-24 sm:py-32 bg-white dark:bg-darkBg">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
                  
                  {/* LEFT SIDE: INFO */}
                  <ScrollReveal className="space-y-16">
                     <div className="space-y-12">
                        <h2 className="text-4xl sm:text-7xl font-[1000] text-brandBlue dark:text-white tracking-tighter uppercase leading-none">Direct <span className="text-brandOrange">Channels.</span></h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                           <div className="p-10 bg-gray-50 dark:bg-gray-800 rounded-[50px] border border-gray-100 dark:border-gray-800 transition-all hover:border-brandOrange group">
                              <div className="w-14 h-14 bg-brandBlue text-white rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">📞</div>
                              <h4 className="text-lg font-black text-brandBlue dark:text-white uppercase mb-2">Call Support</h4>
                              <p className="text-sm font-bold text-gray-500">+92 307 2428203</p>
                           </div>
                           <div className="p-10 bg-gray-50 dark:bg-gray-800 rounded-[50px] border border-gray-100 dark:border-gray-800 transition-all hover:border-brandOrange group">
                              <div className="w-14 h-14 bg-brandOrange text-white rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">📩</div>
                              <h4 className="text-lg font-black text-brandBlue dark:text-white uppercase mb-2">Email Us</h4>
                              <p className="text-sm font-bold text-gray-500">iqrapublicschoolgogeracampus</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-10">
                        <h3 className="text-2xl font-black text-brandBlue dark:text-white uppercase tracking-tighter">Campus Location</h3>
                        <div className="p-10 bg-brandLightBlue dark:bg-gray-800/50 rounded-[60px] flex items-center space-x-8">
                           <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center text-3xl shadow-lg">📍</div>
                           <div>
                              <p className="text-lg font-bold text-brandBlue dark:text-white leading-relaxed">Gogera Road, Gogera, District Okara, Punjab, Pakistan.</p>
                              <a href="#" className="inline-block mt-4 text-brandOrange font-black uppercase text-[10px] tracking-widest hover:underline">Get Directions on Maps →</a>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-2xl font-black text-brandBlue dark:text-white uppercase tracking-tighter">Visiting Hours</h3>
                        <div className="space-y-4">
                           <div className="flex justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl">
                              <span className="font-bold text-gray-500">Monday - Friday</span>
                              <span className="font-black text-brandBlue dark:text-white">08:00 AM - 02:00 PM</span>
                           </div>
                           <div className="flex justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl">
                              <span className="font-bold text-gray-500">Saturday</span>
                              <span className="font-black text-brandBlue dark:text-white">08:00 AM - 12:00 PM</span>
                           </div>
                        </div>
                     </div>
                  </ScrollReveal>

                  {/* RIGHT SIDE: FORM */}
                  <ScrollReveal>
                     <div className="p-10 sm:p-20 bg-brandBlue text-white rounded-[80px] shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
                        <div className="relative z-10 space-y-12">
                           <div className="space-y-4">
                              <h2 className="text-3xl sm:text-6xl font-[1000] uppercase tracking-tighter leading-none">Send a <span className="text-brandOrange">Message.</span></h2>
                              <p className="text-white/60 font-bold">Fill out the form below and our team will get back to you within 24 hours.</p>
                           </div>

                           {formSubmitted ? (
                             <div className="p-12 bg-white/10 rounded-[40px] text-center space-y-6 border border-white/20 animate-fade-up">
                                <div className="text-6xl">✨</div>
                                <h4 className="text-2xl font-black uppercase">Message Received!</h4>
                                <p className="text-sm opacity-60">Thank you for reaching out. We've sent a confirmation to your email.</p>
                             </div>
                           ) : (
                             <form onSubmit={handleFormSubmit} className="space-y-8">
                                <div className="space-y-6">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-brandOrange">Full Name</label>
                                      <input required type="text" className="w-full bg-white/5 border-b border-white/20 py-4 outline-none focus:border-brandOrange transition-all font-bold text-xl placeholder:text-white/10" placeholder="Name" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-brandOrange">Email Address</label>
                                      <input required type="email" className="w-full bg-white/5 border-b border-white/20 py-4 outline-none focus:border-brandOrange transition-all font-bold text-xl placeholder:text-white/10" placeholder="Email" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-brandOrange">Subject</label>
                                      <select className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-brandOrange transition-all font-bold text-xl appearance-none cursor-pointer">
                                         <option className="bg-brandBlue">General Inquiry</option>
                                         <option className="bg-brandBlue">Admission 2024-25</option>
                                         <option className="bg-brandBlue">Fee Query</option>
                                         <option className="bg-brandBlue">Job Application</option>
                                      </select>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-brandOrange">Message</label>
                                      <textarea rows={4} className="w-full bg-white/5 border-b border-white/20 py-4 outline-none focus:border-brandOrange transition-all font-bold text-lg placeholder:text-white/10 resize-none" placeholder="How can we help?"></textarea>
                                   </div>
                                </div>
                                <button type="submit" className="w-full bg-brandOrange text-white py-8 rounded-[40px] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">Deliver Message</button>
                             </form>
                           )}
                        </div>
                     </div>
                  </ScrollReveal>

               </div>
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer id="contact" className="bg-brandBlue dark:bg-[#0a0c0e] text-white pt-24 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
              <div className="space-y-8">
                 <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setView('home')}>
                    <ICONS.ShellyLogo className="w-12 h-12 brightness-150" />
                    <div className="flex flex-col">
                       <span className="text-xl font-[1000] tracking-tighter uppercase leading-none">IQRA PUBLIC</span>
                       <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brandOrange">Gogera Campus</span>
                    </div>
                 </div>
                 <p className="text-sm font-bold text-white/60 leading-relaxed max-w-xs">Empowering the next generation with digital literacy and strong moral foundations through characterize learning.</p>
                 <div className="flex items-center space-x-5">
                    {[ICONS.Facebook, ICONS.Instagram, ICONS.Youtube].map((Icon, idx) => (
                      <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brandOrange hover:text-white transition-all">
                         <Icon className="w-5 h-5" />
                      </a>
                    ))}
                 </div>
              </div>
              <div>
                 <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-brandOrange">Navigation</h4>
                 <ul className="space-y-4">
                    {navLinks.map(link => (
                      <li key={link.name}>
                        <button onClick={() => handleNavLinkClick(link)} className="text-sm font-bold text-white/60 hover:text-white transition-all uppercase tracking-widest">{link.name}</button>
                      </li>
                    ))}
                 </ul>
              </div>
              <div>
                 <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-brandOrange">Programs</h4>
                 <ul className="space-y-4 text-sm font-bold text-white/60">
                    <li className="uppercase tracking-widest">Early Foundation</li>
                    <li className="uppercase tracking-widest">Primary Excellence</li>
                    <li className="uppercase tracking-widest">Middle Hub</li>
                    <li className="uppercase tracking-widest">Digital Skills</li>
                 </ul>
              </div>
              <div>
                 <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-brandOrange">Contact</h4>
                 <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                       <ICONS.Location className="w-4 h-4 text-brandOrange mt-1" />
                       <span className="text-sm font-bold text-white/60 uppercase tracking-wider leading-relaxed">Gogera Road, Okara, Punjab, Pakistan</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <ICONS.Call className="w-4 h-4 text-brandOrange" />
                       <span className="text-sm font-bold text-white/60 tracking-widest">+923072428203</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">© 2025 IQRA PUBLIC SCHOOL • GOGERA CAMPUS. ALL RIGHTS RESERVED.</p>
           </div>
        </div>
      </footer>

      {/* AI ASSISTANT (IPS) */}
      <div className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-[280px] sm:w-[400px] h-[450px] sm:h-[650px] bg-white dark:bg-gray-900 rounded-[30px] sm:rounded-[50px] shadow-3xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 animate-fade-up">
            <div className="bg-brandBlue p-6 sm:p-10 text-white flex justify-between items-center flex-shrink-0">
               <div className="flex items-center space-x-3">
                  <ICONS.ShellyLogo className="w-8 h-8 sm:w-14 sm:h-14 bg-white p-1 rounded-xl" />
                  <h4 className="font-black text-sm sm:text-2xl leading-none">IPS</h4>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="p-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-4 bg-gray-50/50 dark:bg-black/10">
               {chatMessages.map(m => (
                 <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[90%] p-4 sm:p-6 rounded-[25px] sm:rounded-[35px] text-xs sm:text-base font-bold ${
                     m.role === 'user' ? 'bg-brandBlue text-white' : 'bg-white dark:bg-gray-800 text-brandBlue dark:text-white border'
                   }`}>
                     {m.content}
                   </div>
                 </div>
               ))}
               {isTyping && <div className="text-xs font-black animate-pulse px-4 text-brandBlue dark:text-white">IPS is typing...</div>}
               <div ref={chatEndRef} />
            </div>
            <div className="p-4 sm:p-8 border-t bg-white dark:bg-gray-900">
               <div className="flex space-x-2">
                  <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask something..." className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 sm:py-4 rounded-xl sm:rounded-3xl text-xs sm:text-sm font-bold text-brandBlue dark:text-white outline-none" />
                  <button onClick={handleSendMessage} className="bg-brandBlue text-white p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-xl transition-transform active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></button>
               </div>
            </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 sm:w-24 sm:h-24 bg-brandOrange text-white rounded-3xl sm:rounded-[40px] shadow-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 sm:border-8 border-white dark:border-gray-800">
          <ICONS.ShellyLogo className="w-10 h-10 sm:w-14 sm:h-14 brightness-200" />
        </button>
      </div>
    </div>
  );
};

export default App;
