
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import { analyzeWorkCard } from './services/geminiService';
import { CardAnalysisResult } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CardAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rates State - prioritizing 12h as requested
  const [shiftRate12h, setShiftRate12h] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setAnalysis(null);
      const resized = await resizeImage(file);
      setImage(resized);
    }
  };

  const processCard = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeWorkCard(image);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Kuch galat hua. Phirse koshish karein.");
    } finally {
      setIsLoading(false);
    }
  };

  const earnings = useMemo(() => {
    if (!analysis) return 0;
    if (hourlyRate > 0) return analysis.totalHours * hourlyRate;
    if (shiftRate12h > 0) return (analysis.totalHours / 12) * shiftRate12h;
    return 0;
  }, [analysis, hourlyRate, shiftRate12h]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-xl mx-auto p-4 space-y-5">
        {/* Step 1: Image & Action */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-xs">1</span>
              Photo & Scan
            </h2>
            {image && (
               <button onClick={() => {setImage(null); setAnalysis(null);}} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">Hatao</button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${image ? 'border-blue-200 bg-blue-50/30' : 'border-slate-300 hover:border-blue-400'}`}>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {image ? (
                <div className="flex items-center space-x-4">
                  <img src={image} alt="Preview" className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Photo mil gayi!</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Scan button dabayein jaldi hisaab ke liye.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-slate-600 text-sm font-semibold">Card ki photo click karein</p>
                  <p className="text-slate-400 text-xs mt-1">Sahi aur saaf photo kheechein</p>
                </div>
              )}
            </div>

            {image && !analysis && (
              <button
                onClick={processCard}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Jaldi se reading...
                  </>
                ) : "Fast Scan Karein"}
              </button>
            )}
          </div>
        </section>

        {/* Step 2: Rate Input */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2 text-xs">2</span>
            Salary Rate
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 text-center">12 Ghante (1 Shift) ka Paisa</label>
              <div className="relative max-w-[200px] mx-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={shiftRate12h || ''}
                  onChange={(e) => {
                    setShiftRate12h(Number(e.target.value));
                    setHourlyRate(0);
                  }}
                  className="w-full pl-10 pr-4 py-4 text-center text-2xl font-black text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-emerald-100"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="h-px bg-slate-100 flex-1"></span>
              <span className="px-3 text-[10px] font-bold text-slate-300 uppercase italic">Ya phir 1 ghante ka likhein</span>
              <span className="h-px bg-slate-100 flex-1"></span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                placeholder="1 ghante ka rate"
                value={hourlyRate || ''}
                onChange={(e) => {
                  setHourlyRate(Number(e.target.value));
                  setShiftRate12h(0);
                }}
                className="w-full pl-8 pr-4 py-3 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-100 outline-none"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold animate-bounce text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {analysis && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden ring-4 ring-white">
               <div className="relative z-10">
                 <div className="flex justify-between items-start">
                   <div className="space-y-1">
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{analysis.month} {analysis.year}</p>
                     <p className="text-xs font-bold text-blue-400">{analysis.workerName || 'Worker'}</p>
                     <h3 className="text-5xl font-black mt-2 tracking-tighter">₹{earnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/5">
                     <p className="text-slate-400 text-[9px] font-black uppercase">Total Hours</p>
                     <p className="text-2xl font-black">{analysis.totalHours}</p>
                   </div>
                 </div>
                 
                 <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-slate-400 text-[9px] font-black uppercase">Kam ke Din</p>
                      <p className="text-lg font-black">{analysis.workDays.length} Din</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-slate-400 text-[9px] font-black uppercase">Avg. Duty</p>
                      <p className="text-lg font-black">{(analysis.totalHours / analysis.workDays.length).toFixed(1)} hrs</p>
                    </div>
                 </div>
               </div>
               {/* Aesthetic Glow */}
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h4 className="font-black text-slate-800 text-sm uppercase">Rozana ka Hisaab</h4>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-500">{analysis.workDays.length} Entries</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-50">
                    {analysis.workDays.map((day, idx) => {
                      const dayEarnings = hourlyRate > 0 
                        ? day.hours * hourlyRate 
                        : (day.hours / 12) * shiftRate12h;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 text-sm font-bold text-slate-700">{day.date}</td>
                          <td className="py-4 px-5 text-sm">
                            <span className="bg-slate-900 text-white px-2 py-1 rounded-lg text-xs font-black">{day.hours}h</span>
                          </td>
                          <td className="py-4 px-5 text-sm font-black text-slate-900 text-right">
                            ₹{dayEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <button 
              onClick={() => {setAnalysis(null); setImage(null); setError(null); window.scrollTo(0,0);}}
              className="w-full py-5 text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Naya Card Scan Karein ↑
            </button>
          </section>
        )}

        {/* Quick Instructions */}
        {!analysis && !isLoading && (
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Kaise chalega?</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto text-xl">📸</div>
                <p className="text-[10px] font-bold leading-tight">Photo Kheechein</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto text-xl">💰</div>
                <p className="text-[10px] font-bold leading-tight">Rate Likhein</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto text-xl">⚡</div>
                <p className="text-[10px] font-bold leading-tight">Hisaab Dekhein</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
