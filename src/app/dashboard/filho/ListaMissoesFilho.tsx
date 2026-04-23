"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Star, User } from "lucide-react";

export default function ListaMissoesFilho({ tarefas, nomeFilho, progressoDia }: any) {
  const diasMapa: any = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SAB", 0: "DOM" };
  const porcentagemDia = progressoDia?.total > 0 
    ? Math.round((progressoDia.realizado / progressoDia.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Progresso do Filho */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[32px] shadow-sm border border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minhas Missões</span>
          <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Olá, {nomeFilho}! 🚀</h2>
        </div>
        
        <div className="bg-blue-50 pl-5 pr-2 py-2 rounded-full flex items-center gap-3">
          <div className="text-right">
            <p className="text-xl font-black text-slate-800 leading-none">
              {progressoDia?.realizado}<span className="text-slate-300 text-sm">/{progressoDia?.total}</span>
            </p>
            <span className="text-[8px] font-black text-blue-600 uppercase">Pontos Hoje</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border-2 border-blue-100">
            <span className="text-[10px] font-black text-blue-600">{porcentagemDia}%</span>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas (Somente Leitura) */}
      <div className="space-y-4">
        {tarefas.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] py-12 text-center">
            <p className="font-black text-slate-400 uppercase text-xs">Nenhuma missão para você hoje! 🎉</p>
          </div>
        ) : (
          tarefas.map((tarefa: any) => {
            const feito = tarefa.concluido;
            const diasTarefaArray = tarefa.diasSemana ? tarefa.diasSemana.split(",") : [];

            return (
              <motion.div 
                key={tarefa.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 flex items-start gap-4 relative transition-all ${feito ? 'opacity-70' : 'opacity-100'}`}
              >
                {/* Status Visual (Sem clique) */}
                <div className={`flex-shrink-0 mt-1 ${feito ? 'text-[#1DDF6F]' : 'text-slate-100'}`}>
                  {feito ? <CheckCircle2 size={36} /> : <Circle size={36} strokeWidth={1.5} />}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-[#0F172A] text-sm uppercase tracking-tight break-words leading-relaxed ${feito ? 'line-through text-slate-300' : ''}`}>
                    {tarefa.description}
                  </h4>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                    <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg font-black text-[9px] uppercase flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> {tarefa.points} pts
                    </div>
                  </div>

                  {/* Dias que essa tarefa aparece */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {[1, 2, 3, 4, 5, 6, 0].map(diaNum => (
                      <span 
                        key={diaNum}
                        className={`px-2 py-1 rounded-md font-black text-[8px] ${
                          diasTarefaArray.includes(diaNum.toString())
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-slate-50 text-slate-200'
                        }`}
                      >
                        {diasMapa[diaNum]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badge de Status no lugar da lixeira */}
                <div className={`absolute right-6 top-6 text-[8px] font-black uppercase px-2 py-1 rounded-md ${feito ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {feito ? "Concluído" : "Pendente"}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}