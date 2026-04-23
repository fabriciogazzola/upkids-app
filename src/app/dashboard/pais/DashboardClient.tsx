"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, PlusCircle, Calendar, LogOut } from "lucide-react";
import ModalNovaTarefa from "@/components/ModalNovaTarefa";
import TabelaMissoes from "./TabelaMissoes";

export default function DashboardClient({ 
  herois, 
  tarefas, 
  dataContexto, 
  filhosBase, 
  familyId, 
  progressoDia 
}: any) {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "placar";
  const viewingUserId = searchParams.get("userId");

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center font-black text-blue-500 animate-pulse">CARREGANDO... 🚀</div>;

  return (
    <div className="min-h-screen bg-blue-50 font-sans pb-24">
      {/* Navbar */}
      <nav className="bg-white p-4 shadow-md border-b-4 border-yellow-400 flex justify-between items-center px-8 sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard/pais')}>
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Trophy size={20} /></div>
          <span className="font-black text-blue-900 text-xl tracking-tighter uppercase">Up Kids</span>
        </div>
        <button onClick={() => signOut()} className="text-red-500 font-bold flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        
        {/* BOTÕES DE AÇÃO */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 p-6 rounded-[32px] text-white shadow-lg flex flex-col items-center gap-2 border-b-4 border-green-700 active:translate-y-1 transition-all"
          >
            <PlusCircle size={28} />
            <span className="font-black text-xs uppercase tracking-widest">Nova Missão</span>
          </motion.button>
          
          {/* BOTÃO MENSAL AJUSTADO: Removida opacidade e adicionado clique */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/pais/mensal')}
            className="bg-purple-500 p-6 rounded-[32px] text-white shadow-lg flex flex-col items-center gap-2 border-b-4 border-purple-700 active:translate-y-1 transition-all"
          >
            <Calendar size={28} />
            <span className="font-black text-xs uppercase tracking-widest">Extrato</span>
          </motion.button>
        </section>

        {activeTab === "placar" ? (
          <>
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tighter uppercase">
              <Trophy className="text-yellow-500" /> Placar da Semana
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {herois.map((heroi: any) => (
                <FilhoCard 
                  key={heroi.id}
                  nome={heroi.nome} 
                  cor={heroi.nome === "Gabriel" ? "bg-orange-100" : "bg-blue-100"} 
                  borderColor={heroi.nome === "Gabriel" ? "border-orange-400" : "border-blue-400"} 
                  btnColor={heroi.nome === "Gabriel" ? "bg-orange-600" : "bg-blue-600"}
                  pontos={heroi.pontos}
                  meta={heroi.totalSemana} 
                  onVerTarefas={() => router.push(`/dashboard/pais?date=${dataContexto}&tab=missoes&userId=${heroi.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <TabelaMissoes 
              tarefas={tarefas} 
              dataAtual={dataContexto} 
              viewingUserId={viewingUserId} 
              progressoDia={progressoDia}
            />
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ModalNovaTarefa 
            filhos={filhosBase} 
            familyId={familyId} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilhoCard({ nome, cor, borderColor, btnColor, pontos, meta, onVerTarefas }: any) {
  const metaSegura = meta > 0 ? meta : 1;
  const progresso = Math.min((pontos / metaSegura) * 100, 100);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${cor} rounded-[40px] p-8 border-b-8 ${borderColor} shadow-xl relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{nome}</h3>
          <span className="bg-white/60 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600">Super Herói</span>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-slate-800 tracking-tighter">
            {pontos}
            <span className="text-slate-400 text-2xl font-bold">/{meta}</span>
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pontos na Semana</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full h-8 bg-white/40 rounded-full overflow-hidden p-1.5 border-2 border-white shadow-inner">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progresso}%` }} 
            className={`h-full ${btnColor} rounded-full shadow-lg transition-all duration-1000`} 
          />
        </div>
      </div>

      <button onClick={onVerTarefas} className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-md ${btnColor} hover:brightness-110 active:scale-95 transition-all`}>
        Ver Missões de Hoje
      </button>
    </motion.div>
  );
}