"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Calendar, Send, User, Clock, Eye, X, ImageIcon, Map, Box, Loader2, MessageSquareQuote } from "lucide-react";

// ✅ 1. เพิ่ม Import SweetAlert2
import Swal from 'sweetalert2';

// ✅ 2. Import Firebase
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig"; // ⚠️ ตรวจสอบว่าชื่อไฟล์ตรงกับในเครื่องนะครับ (firebaseConfig.ts หรือ fire.ts)

// --- Type Definitions for Model Viewer ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        poster?: string;
        alt?: string;
        'shadow-intensity'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        ar?: boolean;
        'ar-modes'?: string;
        'touch-action'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'camera-orbit'?: string;
        'interaction-prompt-threshold'?: string;
        style?: React.CSSProperties;
        'on-load'?: () => void;
      }, HTMLElement>;
    }
  }
}

const graduateInfo = {
  name: "นายภูสิทธิ บุญวงศ์",
  faculty: "คณะวิศวกรรมศาสตร์",
  university: "มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร วิทยาเขตพระนครเหนือ",
  year: "ปีการศึกษา 2567",
  phone: "097-178-4484",
  lineId: "phu20453.",
  imageProfile: "/graduate-profile2.JPG",
};

const schedule = [
  {
    type: "วันซ้อมย่อย",
    date: "1 มีนาคม 2569",
    time: "16:00 น.",
    location: "ภายในมหาวิทยาลัย",
    note: "จอดรถได้ที่ บริษัท CPAC (ใกล้มหาวิทยาลัย)",
    imageMap: "/small.jpg",
  },
  
  {
    type: "วันซ้อมใหญ่",
    date: "11 มีนาคม 2569",
    time: "12:00 น.",
    location: "ภายในมหาวิทยาลัย",
    note: "ไม่มีที่จอดรถภายในมหาวิทยาลัย กรุณาใช้บริการรถสาธารณะ",
    imageMap: "/big.jpg",
  },
  {
    type: "วันพิธีพระราชทานปริญญาบัตร",
    date: "13 มีนาคม 2569",
    time: "12:00 น.",
    location: "ภายในมหาวิทยาลัย",
    note: "ไม่มีที่จอดรถภายในมหาวิทยาลัย กรุณาใช้บริการรถสาธารณะ",
    imageMap: "/big.jpg",
  },
];

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

// 🔥 NEW: อนิเมชั่นคอมเมนต์แบบ "Brutal Pop" (เด้งแรงๆ)
const commentVariant = {
  hidden: { opacity: 0, scale: 0.3, y: -50, rotate: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    rotate: 0,
    transition: { type: "spring", stiffness: 400, damping: 15 } 
  },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
};

// ✅ ฟังก์ชันแปลงเวลาจาก Firebase เป็นไทย
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "เมื่อสักครู่..."; 
  const date = timestamp.toDate(); 
  return date.toLocaleDateString("th-TH", {
    day: 'numeric', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }) + " น.";
};

export default function Home() {
  const [comments, setComments] = useState<{ id: string; name: string; msg: string; createdAt: any }[]>([]);
  const [inputName, setInputName] = useState("");
  const [inputMsg, setInputMsg] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    document.body.appendChild(script);
    return () => {
        if(document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Fetch Data
  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedComments: any[] = [];
      querySnapshot.forEach((doc) => {
        loadedComments.push({ id: doc.id, ...doc.data() });
      });
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, []);

  // --- Animation: เลือกแบบ "โยนหมวกปริญญา" ให้เป็นค่าเริ่มต้น (เปลี่ยนได้) ---
  const fireFormalConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const scalar = 3; 
    const hatShape = confetti.shapeFromText({ text: '🎓', scalar }); // รูปหมวก
    const popShape = confetti.shapeFromText({ text: '🎉', scalar }); // รูปพลุ

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 20 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        shapes: [hatShape, popShape], 
        gravity: 0.8, 
        scalar: 2
      });
    }, 250);
  };

  // ✅ ฟังก์ชันส่งข้อมูลพร้อม Popup ขอบคุณ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName || !inputMsg) return;

    setIsSubmitting(true);
    try {
      // 1. ส่งเข้า Firebase
      await addDoc(collection(db, "wishes"), {
        name: inputName,
        msg: inputMsg,
        createdAt: serverTimestamp()
      });

      // 2. ยิงพลุ
      fireFormalConfetti();

      // 3. แสดง Popup ขอบคุณ (SweetAlert2)
      setTimeout(() => {
          Swal.fire({
            title: 'ขอบคุณครับ! 🎉',
            text: 'ข้อความของคุณถูกส่งเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ยินดีด้วย!',
            confirmButtonColor: '#0f172a', // สี slate-900
            background: '#ffffff',
            iconColor: '#EAB308', // สีเหลืองทอง
          });
      }, 500);

      // 4. ล้างค่า
      setInputName("");
      setInputMsg("");

    } catch (error) {
      console.error("Error adding document: ", error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ... (Modal Popup) ... */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b bg-slate-100">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={20}/> ดูรูปภาพขยาย</h3>
                <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
              </div>
              <div className="p-1 bg-slate-200">
                <img src={selectedImage} alt="Detail" className="w-full h-auto max-h-[80vh] object-contain mx-auto" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ... (Header) ... */}
      <header className="bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, type: "spring" }} className="text-center md:text-left space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="inline-block px-4 py-1 border border-yellow-600/50 rounded-sm text-yellow-500 text-sm tracking-widest uppercase mb-4">Official Invitation</motion.div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">พิธีพระราชทาน<br /><motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">ปริญญาบัตร</motion.span></h1>
            <div className="space-y-2 text-slate-300 font-light text-lg">
              <p className="text-2xl font-medium text-white">{graduateInfo.name}</p>
              <p>{graduateInfo.faculty}</p>
              <p>{graduateInfo.university}</p>
              <p className="text-yellow-500/80 pt-2">{graduateInfo.year}</p>
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="pt-8 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
               <button onClick={() => document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-sm hover:bg-slate-200 transition-colors shadow-md hover:shadow-lg">ดูกำหนดการ</button>
               <button onClick={() => document.getElementById('wishes')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 border border-slate-600 text-white font-semibold rounded-sm hover:border-yellow-500 hover:text-yellow-500 transition-colors">ร่วมแสดงความยินดี</button>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.2 }} className="relative">
            <div className="absolute inset-0 bg-yellow-500 rounded-lg transform translate-x-4 translate-y-4 -z-10 hidden md:block"></div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-2xl border-4 border-slate-800 relative group">
              <img src={graduateInfo.imageProfile} alt="Graduate Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
            </div>
          </motion.div>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></motion.div>
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 10, delay: 1 }} className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></motion.div>
      </header>

      {/* ... (Model Showcase) ... */}
      <section className="bg-slate-100 py-16 px-6 relative z-20 border-b border-slate-200">
          <div className="max-w-5xl mx-auto">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-slate-900 relative inline-block pb-3">
                  Model 3D มหาวิทยาลัย 
                  <motion.span initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1 }} className="absolute bottom-0 left-0 h-1 bg-yellow-500"></motion.span>
                </h2>
                <p className="text-slate-600 mt-4 font-medium">CPE Senior Project Showcase</p>
              </div>
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative h-[500px] w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  {!isModelLoaded && (<div className="absolute z-0 flex flex-col items-center text-slate-500 animate-pulse"><Loader2 className="w-10 h-10 animate-spin mb-2" /><p className="text-sm font-medium">กำลังโหลดโมเดล 3D...</p></div>)}
                  <model-viewer src="/api/model-glb" ios-src="/api/model-usdz" camera-controls ar ar-modes="scene-viewer quick-look webxr" auto-rotate shadow-intensity="1" touch-action="pan-y" min-camera-orbit="auto auto 1m" max-camera-orbit="auto 90deg auto" camera-orbit="20deg 85deg 1725m" interaction-prompt-threshold="500" alt="3D model of a car" 
                  // @ts-ignore
                  on-load={() => setIsModelLoaded(true)} style={{ width: '100%', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 10 }}>
                    <div slot="ar-button" className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg cursor-pointer flex items-center gap-2 hover:bg-yellow-400 transition-colors"><Box size={16} /> View AR</div>
                  </model-viewer>
              </motion.div>
              <p className="text-center text-slate-500 text-sm mt-4">* สามารถหมุนดูโมเดล 3D หรือกดปุ่ม AR บนมือถือเพื่อวางรถบนพื้นจริงได้</p>
          </div>
      </section>

      {/* ... (Schedule) ... */}
      <section id="schedule" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12"><h2 className="text-3xl font-serif font-bold text-slate-900 relative inline-block pb-3">กำหนดการพิธี<motion.span initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1 }} className="absolute bottom-0 left-0 h-1 bg-yellow-500"></motion.span></h2></div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="bg-white shadow-xl border border-slate-200 rounded-lg overflow-hidden">
          {schedule.map((item, index) => (
            <motion.div variants={fadeInUp} key={index} className={`p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors group ${index === schedule.length - 1 ? 'border-none' : ''}`}>
              <div className="md:w-1/4 flex-shrink-0">
                <div className="bg-slate-100 text-slate-700 rounded p-4 text-center border-l-4 border-slate-900 group-hover:border-yellow-500 transition-colors duration-300">
                  <span className="block text-sm font-bold uppercase tracking-wide text-slate-500">{item.date.split(' ')[1]} {item.date.split(' ')[2]}</span>
                  <span className="block text-4xl font-bold text-slate-900 my-1">{item.date.split(' ')[0]}</span>
                  <span className="block text-xs text-slate-400">2569</span>
                </div>
              </div>
              <div className="md:w-3/4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">{item.type}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-slate-600 text-sm mt-3">
                    <p className="flex items-center gap-2"><Clock size={16} className="text-yellow-600"/> {item.time}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-yellow-600"/> {item.location}</p>
                  </div>
                  <p className="text-slate-500 text-sm italic mt-2 border-t border-dashed border-slate-200 pt-2">หมายเหตุ: {item.note}</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedImage(item.imageMap)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded shadow-md hover:bg-yellow-600 transition-colors"><Eye size={16} /> ดูรายละเอียด</motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ... (Location) ... */}
      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-slate-100 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPin className="text-slate-900" /> แผนที่การเดินทาง</h3>
            <div className="h-80 bg-slate-300 rounded-lg shadow-md overflow-hidden border border-slate-200 relative group">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.346280006492!2d100.5096033759347!3d13.81823348658059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9f54b53151%3A0x73d2b2a69752fd89!2z4Lio4Li54LiZ4Lii4LmM4Lie4Lij4Liw4LiZ4LiE4Lij4LmA4Lir4LiZ4Li34LitIOC4oeC4q-C4suC4p-C4tOC4l-C4ouC4suC4peC4seC4ouC5gOC4l-C4hOC5guC4meC5guC4peC4ouC4teC4o-C4suC4iuC4oeC4h-C4hOC4peC4nuC4o-C4sOC4meC4hOC4ow!5e0!3m2!1sth!2sth!4v1770898861249!5m2!1sth!2sth" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" className="grayscale group-hover:grayscale-0 transition-all duration-500"></iframe>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
               <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedImage("/1.jpg")} className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded shadow-sm hover:border-yellow-500 hover:text-yellow-600 transition-colors text-sm font-bold text-slate-700"><Map size={18} /> แผนที่ภายใน (1)</motion.button>
               <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedImage("/2.jpg")} className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded shadow-sm hover:border-yellow-500 hover:text-yellow-600 transition-colors text-sm font-bold text-slate-700"><Map size={18} /> แผนที่ภายใน (2)</motion.button>
            </div>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">* แนะนำให้ใช้บริการรถสาธารณะเนื่องจากการจราจรภายในมหาวิทยาลัยหนาแน่น</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-yellow-500 transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">ข้อมูลติดต่อ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 shrink-0"><Phone size={20} /></div><div><p className="font-bold text-slate-800">โทรศัพท์</p><a href={`tel:${graduateInfo.phone}`} className="text-yellow-600 hover:underline">{graduateInfo.phone}</a></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 bg-[#06C755]/10 rounded-full flex items-center justify-center text-[#06C755] shrink-0"><span className="font-bold text-xs">LINE</span></div><div><p className="font-bold text-slate-800">Line ID</p><p className="text-slate-500">{graduateInfo.lineId}</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- Guestbook Section (อัปเกรด) --- */}
      <section id="wishes" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-10"><h2 className="text-3xl font-serif font-bold text-slate-900">ร่วมแสดงความยินดี</h2><p className="text-slate-500 mt-2">Congratulatory Message Registry</p></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-white border border-slate-200 shadow-xl rounded-sm p-8 md:p-12">
          
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">ชื่อ - นามสกุล</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 transition-colors" placeholder="ระบุชื่อของท่าน" value={inputName} onChange={(e) => setInputName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">ข้อความอวยพร</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 transition-colors" placeholder="ขอแสดงความยินดี..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} /></div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.9, rotate: 1 }}
              type="submit" 
              disabled={isSubmitting} 
              className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-medium rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg disabled:opacity-50"
            >
              <Send size={16} /> {isSubmitting ? "กำลังส่ง..." : "แสดงความยินดีกับบัณฑิต"}
            </motion.button>
          </form>

          <div className="border-t border-slate-200 pt-8">
            <h3 className="font-serif font-bold text-lg mb-6 text-slate-800">รายนามคนร่วมแสดงความยินดี ({comments.length})</h3>
            {comments.length === 0 ? (
              <p className="text-center text-slate-400 py-8 font-light italic">ยังไม่มีข้อความ (เป็นคนแรกเลยไหม!)</p>
            ) : (
              <ul className="space-y-4"> 
                <AnimatePresence initial={false} mode="popLayout">
                  {comments.map((c) => (
                    <motion.li 
                      key={c.id} 
                      layout 
                      variants={commentVariant} 
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mt-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shrink-0 shadow flex items-center justify-center text-white font-bold text-lg">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                           <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                           <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100">
                             <Clock size={10} /> {formatTimestamp(c.createdAt)}
                           </span>
                        </div>
                        <p className="text-slate-700 mt-2 font-light text-base relative">
                          <MessageSquareQuote size={14} className="inline mr-2 text-slate-300" />
                          {c.msg}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </motion.div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800"><p>© 2569 {graduateInfo.name} | {graduateInfo.faculty}</p></footer>
    </div>
  );
}