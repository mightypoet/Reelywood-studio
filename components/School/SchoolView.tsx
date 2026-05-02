
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  PlayCircle, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Linkedin,
  Rocket,
  Zap,
  Globe,
  Star,
  MessageSquare
} from 'lucide-react';

interface SchoolViewProps {
  onBack?: () => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-4 border-black bg-white mb-4 overflow-hidden neo-shadow group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-[#ffde59]"
      >
        <span className="font-black uppercase tracking-tight text-lg">{question}</span>
        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 border-t-4 border-black"
          >
            <p className="font-medium text-slate-800 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProgramCard = ({ title, desc, duration, price, category, accentColor }: { title: string, desc: string, duration: string, price: string, category: string, accentColor: string }) => (
  <motion.div 
    whileHover={{ x: -4, y: -4 }}
    className="border-4 border-black bg-white p-6 neo-shadow flex flex-col h-full group"
  >
    <div className={`inline-block px-3 py-1 border-2 border-black font-black text-[10px] uppercase tracking-widest mb-4 w-fit`} style={{ backgroundColor: accentColor }}>
      {category}
    </div>
    <h3 className="text-2xl font-black uppercase mb-3 leading-tight">{title}</h3>
    <p className="text-slate-600 font-medium mb-6 flex-grow">{desc}</p>
    <div className="space-y-3 mb-8">
      <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wider">
        <Clock size={16} />
        <span>{duration}</span>
      </div>
      <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wider">
        <Zap size={16} />
        <span>{price}</span>
      </div>
    </div>
    <button className={`w-full py-4 border-4 border-black font-black uppercase tracking-widest text-xs neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`} style={{ backgroundColor: accentColor }}>
      Enroll Now
    </button>
  </motion.div>
);

export const SchoolView: React.FC<SchoolViewProps> = ({ onBack }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 45, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59, minutes_prev: prev.minutes - 1 };
        // Simplified for demo
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToRegistration = () => {
    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-['Lexend',_sans-serif] text-black selection:bg-[#ffde59] overflow-x-hidden">
      {/* Floating Sticky Banner */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-[#ffde59] border-b-4 border-black py-3 px-4 flex items-center justify-center space-x-4 cursor-pointer hover:bg-[#fff0b3] transition-colors"
        onClick={scrollToRegistration}
      >
        <Rocket className="shrink-0" size={20} />
        <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs text-center">
          🔥 Free AI Webinar This Week — Limited Seats Available
        </span>
        <ArrowRight size={16} className="hidden sm:block" />
      </motion.div>

      {/* Nav */}
      <nav className="pt-20 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 border-4 border-black bg-[#ffde59] flex items-center justify-center neo-shadow group-hover:shadow-none transition-all">
            <span className="font-black text-xl">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg leading-none uppercase">School</span>
            <span className="font-bold text-[8px] tracking-[0.4em] uppercase text-slate-400">By Reelywood</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {['About', 'Programs', 'Webinar', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="font-black uppercase tracking-widest text-xs hover:text-[#834bf1] transition-colors">
              {item}
            </a>
          ))}
          <button 
            onClick={scrollToRegistration}
            className="px-6 py-3 border-4 border-black bg-black text-white font-black uppercase tracking-widest text-xs neo-shadow hover:bg-[#834bf1] hover:text-white transition-all"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-24 md:pt-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-2 border-4 border-black bg-[#834bf1] text-white font-black uppercase tracking-[0.3em] text-xs neo-shadow">
              Future of Learning is Here
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              Learn AI.<br />
              <span className="text-[#834bf1]">Build Faster.</span><br />
              Earn More.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-700 max-w-xl leading-relaxed">
              Master practical AI tools, automation systems, content creation workflows, and business growth strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={scrollToRegistration}
                className="px-10 py-6 border-4 border-black bg-[#ffde59] font-black uppercase tracking-widest text-sm neo-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center space-x-3"
              >
                <span>Register Webinar</span>
                <PlayCircle size={20} />
              </button>
              <a 
                href="#programs" 
                className="px-10 py-6 border-4 border-black bg-white font-black uppercase tracking-widest text-sm neo-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center"
              >
                Explore Programs
              </a>
            </div>
            
            {/* Countdown */}
            <div className="pt-12">
              <p className="font-black uppercase tracking-widest text-xs mb-4 text-slate-400">Upcoming Live Webinar in:</p>
              <div className="flex space-x-4">
                {[
                  { val: timeLeft.days, unit: 'Days' },
                  { val: timeLeft.hours, unit: 'Hours' },
                  { val: timeLeft.minutes, unit: 'Min' },
                  { val: timeLeft.seconds, unit: 'Sec' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-black bg-white flex items-center justify-center neo-shadow">
                      <span className="text-2xl md:text-3xl font-black">{item.val.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="mt-2 font-black uppercase text-[10px] tracking-widest">{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-[#834bf1] border-4 border-black translate-x-4 translate-y-4"></div>
            <div className="relative border-4 border-black bg-[#ffde59] p-8 aspect-square flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 border-4 border-black bg-white rounded-full mx-auto flex items-center justify-center neo-shadow">
                  <PlayCircle size={48} className="text-[#834bf1]" />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-3xl uppercase leading-none">Live AI Training</p>
                  <p className="font-bold text-lg uppercase tracking-widest opacity-60">Batch Starts Soon</p>
                </div>
                <div className="flex -space-x-3 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 border-4 border-black bg-white rounded-full flex items-center justify-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full rounded-full" />
                    </div>
                  ))}
                  <div className="w-12 h-12 border-4 border-black bg-black text-white rounded-full flex items-center justify-center font-black text-xs">
                    +2k
                  </div>
                </div>
              </div>
            </div>
            {/* Decal */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 border-4 border-black bg-[#00d1ff] rotate-12 flex items-center justify-center neo-shadow p-4 text-center">
              <span className="font-black uppercase text-xs leading-tight">100% Industry Ready</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#f0f0f0] border-y-4 border-black py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="border-4 border-black bg-[#ff00e5] p-12 neo-shadow rotate-[-2deg]">
                <h2 className="text-4xl font-black uppercase mb-6 text-white">The School of Now.</h2>
                <p className="text-xl font-bold text-white mb-8 leading-relaxed">
                  Traditional education is slow. AI is fast. We bridge the gap by teaching you the exact tools being used by top tech companies and creators today.
                </p>
                <div className="space-y-4">
                  {[
                    "Zero theory, 100% practical workshops",
                    "Mentors from top global startups",
                    "Access to exclusive AI templates",
                    "Job & project assistance"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-white font-black uppercase text-xs">
                      <CheckCircle size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase leading-tight">
                Why AI Education Matters <span className="text-[#834bf1]">Now.</span>
              </h2>
              <p className="text-lg font-medium text-slate-700 leading-relaxed">
                Reelywood School is the educational heartbeat of the Reelywood ecosystem. Our mission is simple: to make high-end AI knowledge accessible to everyone—from solo creators to enterprise brands.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="border-4 border-black bg-white p-6 neo-shadow">
                  <p className="text-4xl font-black mb-2">50+</p>
                  <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">AI Tools Mastered</p>
                </div>
                <div className="border-4 border-black bg-white p-6 neo-shadow">
                  <p className="text-4xl font-black mb-2">10k+</p>
                  <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Active Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-20 space-y-4">
          <div className="inline-block px-4 py-2 border-4 border-black bg-[#00d1ff] font-black uppercase tracking-[0.3em] text-xs">
            Curriculum Built for Action
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none">Explore Our Programs.</h2>
        </div>

        <div className="space-y-24">
          {/* Individuals */}
          <div className="space-y-12">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center neo-shadow">
                <Users size={32} />
              </div>
              <h3 className="text-4xl font-black uppercase">For Individuals</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProgramCard 
                category="Students"
                title="AI for Students"
                desc="Learn how to use AI for research, assignments, and building projects that stand out."
                duration="4 Weeks"
                price="₹4,999"
                accentColor="#ffde59"
              />
              <ProgramCard 
                category="Freelancers"
                title="AI for Freelancers"
                desc="Scale your service business with AI. Master delivery automation and high-speed workflows."
                duration="6 Weeks"
                price="₹9,999"
                accentColor="#834bf1"
              />
              <ProgramCard 
                category="Creators"
                title="AI Content Creation"
                desc="Master short-form video AI, image generation, and script writing at 10x speed."
                duration="4 Weeks"
                price="₹7,999"
                accentColor="#ff00e5"
              />
              <ProgramCard 
                category="Career"
                title="AI Career Growth"
                desc="Future-proof your job. Learn AI integration in traditional roles to become irreplaceable."
                duration="8 Weeks"
                price="₹14,999"
                accentColor="#00d1ff"
              />
              <ProgramCard 
                category="Specialized"
                title="Prompt Engineering"
                desc="The elite bootcamp. Master the art of talking to AI for maximum output quality."
                duration="4 Weeks"
                price="₹6,999"
                accentColor="#99ff00"
              />
            </div>
          </div>

          {/* Businesses */}
          <div className="space-y-12">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 border-4 border-black bg-black text-white flex items-center justify-center neo-shadow">
                <Briefcase size={32} />
              </div>
              <h3 className="text-4xl font-black uppercase">For Businesses</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProgramCard 
                category="SMEs"
                title="AI for Small Businesses"
                desc="Optimize operations, inventory, and staff management using custom AI solutions."
                duration="8 Weeks"
                price="₹24,999"
                accentColor="#ffde59"
              />
              <ProgramCard 
                category="Marketing"
                title="Marketing Automation"
                desc="Deploy AI agents for 24/7 social media, email marketing, and lead generation."
                duration="6 Weeks"
                price="₹19,999"
                accentColor="#834bf1"
              />
              <ProgramCard 
                category="Sales"
                title="Sales AI Automation"
                desc="Automate outreach, follow-ups, and documentation to close deals while you sleep."
                duration="6 Weeks"
                price="₹21,999"
                accentColor="#ff00e5"
              />
              <ProgramCard 
                category="Support"
                title="AI Support Systems"
                desc="Build custom knowledge-base bots that handle 80% of customer tickets instantly."
                duration="4 Weeks"
                price="₹15,999"
                accentColor="#00d1ff"
              />
              <ProgramCard 
                category="Operations"
                title="AI Business Systems"
                desc="The master program for CEOs. Re-engineer your entire company with AI at the core."
                duration="12 Weeks"
                price="₹49,999"
                accentColor="#99ff00"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Section */}
      <section id="webinar" className="bg-black py-24 border-y-4 border-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-4 border-white p-8 md:p-16 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-block px-4 py-2 border-2 border-white bg-[#ffde59] text-black font-black uppercase tracking-[0.3em] text-xs">
                Live Interactive Webinar
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase leading-tight">
                AI Foundations:<br />
                The <span className="text-[#00d1ff]">10X</span> Workflow.
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-white flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Date</p>
                    <p className="font-black uppercase">Saturday, May 15</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-white flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Time</p>
                    <p className="font-black uppercase">7:00 PM IST</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <p className="font-black uppercase tracking-widest text-sm text-[#ffde59]">What you'll learn:</p>
                {[
                  "How to structure an AI-first business",
                  "Top 5 automation tools for 2024",
                  "Live demo: Building a content bot in 15 mins",
                  "Exclusive framework for prompt engineering"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 font-bold text-slate-300">
                    <CheckCircle size={18} className="text-[#00d1ff]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full max-w-sm shrink-0">
              <div className="border-4 border-white bg-white p-6 rotate-3">
                <div className="aspect-[4/5] bg-slate-200 border-4 border-black mb-6 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" alt="Speaker" className="w-full h-full object-cover grayscale" />
                   <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                     Main Host
                   </div>
                </div>
                <div className="text-black space-y-2">
                  <p className="text-2xl font-black uppercase">Aditya Sharma</p>
                  <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Founder, Reelywood</p>
                </div>
              </div>
              <div className="mt-12 space-y-4">
                <div className="bg-[#ff0000] py-2 px-4 border-2 border-white text-center animate-pulse">
                   <span className="font-black uppercase tracking-widest text-xs">Only 12 Seats Remaining!</span>
                </div>
                <button 
                  onClick={scrollToRegistration}
                  className="w-full py-5 border-4 border-white bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-[#ffde59] transition-colors"
                >
                  Register Now Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase leading-none">Join the AI Elite.</h2>
            <p className="text-xl font-medium text-slate-600 leading-relaxed">
              Fill out the form to register for the upcoming webinar or request a call-back for our specialized programs.
            </p>
            <div className="pt-8 space-y-6">
              <div className="flex items-center space-x-6 p-6 border-4 border-black bg-[#f0f0f0] neo-shadow">
                <Globe size={32} />
                <div>
                   <p className="font-black uppercase text-xs tracking-widest text-slate-400">Join From</p>
                   <p className="text-xl font-black uppercase">Anywhere Globally</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 p-6 border-4 border-black bg-[#f0f0f0] neo-shadow">
                <Users size={32} />
                <div>
                   <p className="font-black uppercase text-xs tracking-widest text-slate-400">Networking</p>
                   <p className="text-xl font-black uppercase">Exclusive Community</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#00d1ff] border-4 border-black translate-x-4 translate-y-4"></div>
            <form 
              action="https://submit-form.com/YOUR_FORMSPARK_LINK"
              method="POST"
              className="relative p-8 border-4 border-black bg-white space-y-6"
            >
              <div className="space-y-2">
                <label className="font-black uppercase text-xs tracking-widest">Full Name</label>
                <input required type="text" name="name" className="w-full p-4 border-4 border-black font-bold focus:bg-[#ffde59] outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-xs tracking-widest">Email Address</label>
                <input required type="email" name="email" className="w-full p-4 border-4 border-black font-bold focus:bg-[#ffde59] outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-xs tracking-widest">Phone Number</label>
                <input required type="tel" name="phone" className="w-full p-4 border-4 border-black font-bold focus:bg-[#ffde59] outline-none" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-xs tracking-widest">I am a...</label>
                <select name="type" className="w-full p-4 border-4 border-black font-bold focus:bg-[#ffde59] outline-none appearance-none">
                  <option>Individual / Student</option>
                  <option>Freelancer / Creator</option>
                  <option>Business Owner</option>
                  <option>Professional</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase text-xs tracking-widest">What do you want to learn?</label>
                <textarea name="interest" className="w-full p-4 border-4 border-black font-bold focus:bg-[#ffde59] outline-none min-h-[100px]" placeholder="Explain your goals..."></textarea>
              </div>
              <button type="submit" className="w-full py-5 border-4 border-black bg-black text-white font-black uppercase tracking-widest text-sm hover:bg-[#834bf1] transition-colors neo-shadow">
                Register For Webinar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="bg-[#834bf1] py-24 border-y-4 border-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-7xl font-black uppercase mb-6">Why Learn With Us.</h2>
             <p className="text-xl font-bold opacity-80 uppercase tracking-widest">The Reelywood Advantage</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: Zap, title: "Live Training", desc: "No pre-recorded static content. Interactive live sessions with experts." },
              { Icon: Globe, title: "Real-world Tools", desc: "Master tools actually used in production environments, not toys." },
              { Icon: Rocket, title: "Templates", desc: "Get over 100+ proven AI automation templates for your business." },
              { Icon: Users, title: "Community", desc: "Access our private Discord network of AI builders and creators." },
              { Icon: CheckCircle, title: "Certifications", desc: "Reelywood Certified AI Specialist badge for your professional profile." },
              { Icon: Briefcase, title: "Implementation", desc: "We don't just teach. We help you deploy systems into your workflow." }
            ].map((item, i) => (
              <div key={i} className="border-4 border-white p-8 hover:bg-white hover:text-black transition-all group">
                <div className="w-16 h-16 border-4 border-white group-hover:border-black flex items-center justify-center mb-6 transition-all">
                  <item.Icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase mb-3">{item.title}</h3>
                <p className="font-bold opacity-70 group-hover:opacity-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase">Success Stories.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah K.", role: "Freelance Designer", text: "AI Content Creation program cut my work time by 70%. I now handle 3x more clients.", color: "#ffde59" },
            { name: "Rahul M.", role: "SME Owner", text: "Automated our customer support using the AI Business Systems program. ROI was instant.", color: "#834bf1" },
            { name: "Kevin L.", role: "CS Student", text: "The Prompt Engineering bootcamp is next level. It's like having a superpower in code.", color: "#00d1ff" }
          ].map((item, i) => (
            <div key={i} className="border-4 border-black p-8 neo-shadow bg-white flex flex-col items-center text-center">
              <div className="w-20 h-20 border-4 border-black rounded-full overflow-hidden mb-6 neo-shadow">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} alt="avatar" />
              </div>
              <div className="flex space-x-1 mb-4 text-[#ffde59]">
                 {[1,2,3,4,5].map(j => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="italic font-bold text-lg mb-6 leading-relaxed">"{item.text}"</p>
              <div>
                <p className="font-black uppercase">{item.name}</p>
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#f0f0f0] border-y-4 border-black py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black uppercase">FAQ.</h2>
          </div>
          <FAQItem 
            question="Is this beginner friendly?" 
            answer="Absolutely. We start from the absolute basics and move to advanced systems. You don't need to be a 'techie' to learn AI." 
          />
          <FAQItem 
            question="Will recordings be provided?" 
            answer="Yes, all live sessions are recorded and made available in the student portal for lifetime access." 
          />
          <FAQItem 
            question="Are certifications included?" 
            answer="Yes, upon successful completion of the course project, you receive a Reelywood Certified AI Specialist certificate." 
          />
          <FAQItem 
            question="Can businesses enroll teams?" 
            answer="We offer specialized corporate training packages. Contact us via WhatsApp for team enrollment discounts." 
          />
          <FAQItem 
            question="Do you provide implementation help?" 
            answer="Our Business Programs include direct consulting hours to help you implement the automation systems in your company." 
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white text-center px-6 overflow-hidden relative">
        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          <h2 className="text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
            Future-proof your <br />
            <span className="text-[#834bf1]">Career & Business</span> <br />
            with AI.
          </h2>
          <button 
            onClick={scrollToRegistration}
            className="px-16 py-8 border-4 border-black bg-[#ffde59] font-black uppercase tracking-[0.2em] text-xl neo-shadow hover:translate-x-4 hover:translate-y-4 hover:shadow-none transition-all"
          >
            Register For Webinar
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-[#834bf1] opacity-20"><Zap size={120} /></div>
        <div className="absolute bottom-10 right-10 text-[#00d1ff] opacity-20"><Star size={120} /></div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-24 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 border-4 border-white bg-[#ffde59] flex items-center justify-center text-black">
                <span className="font-black text-2xl">R</span>
              </div>
              <span className="font-black text-3xl uppercase">School</span>
            </div>
            <p className="text-xl font-bold text-slate-400 max-w-sm">
              Empowering the next generation of creators and business owners with practical AI education.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="p-3 border-2 border-white hover:bg-white hover:text-black transition-all"><Instagram size={24} /></a>
              <a href="#" className="p-3 border-2 border-white hover:bg-white hover:text-black transition-all"><Twitter size={24} /></a>
              <a href="#" className="p-3 border-2 border-white hover:bg-white hover:text-black transition-all"><Linkedin size={24} /></a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-black uppercase tracking-widest text-[#ffde59]">Quick Links</h4>
            <div className="flex flex-col space-y-4 font-black uppercase text-xs tracking-widest">
              <a href="#about" className="hover:text-[#00d1ff]">About</a>
              <a href="#programs" className="hover:text-[#00d1ff]">Programs</a>
              <a href="#webinar" className="hover:text-[#00d1ff]">Webinar</a>
              <a href="#faq" className="hover:text-[#00d1ff]">FAQ</a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-black uppercase tracking-widest text-[#ffde59]">Contact Us</h4>
            <div className="flex flex-col space-y-4 font-bold">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span className="text-sm">hello@reelywood.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare size={16} />
                <span className="text-sm">WhatsApp: +91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t-2 border-white/10 flex flex-col md:flex-row justify-between items-center opacity-50">
           <p className="font-black uppercase text-[10px] tracking-widest">© 2024 Reelywood Studio. All rights Reserved.</p>
           <p className="font-black uppercase text-[10px] tracking-widest mt-4 md:mt-0">Designed in Brutalist Core.</p>
        </div>
      </footer>
    </div>
  );
};
