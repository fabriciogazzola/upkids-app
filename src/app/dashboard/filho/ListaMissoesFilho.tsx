"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Star, Trophy, Medal, Target } from "lucide-react";

export default function ListaMissoesFilho({ tarefas, nomeFilho, progressoDia, herois = [], userId }: any) {
  const diasMapa: any = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SAB", 0: "DOM" };
  const porcentagemDia = progressoDia?.total > 0 
    ? Math.round((progressoDia.realizado / progressoDia.total) * 100) 
    : 0;

  // Ordena heróis por pontos para o Ranking
  const heroisOrdenados = [...herois].sort((a, b) => b.pontos - a.pontos);

  return (
    <div className="space-y-8">
      
      {/* SEÇÃO: RANKING COM MARCADORES DE META */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="font-black text-slate-800 uppercase text-[12px] tracking-widest italic">Ranking da Semana</h3>
          </div>

        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heroisOrdenados.map((heroi, index) => {
            const isMe = heroi.id === userId;
            
            // LÓGICA DE APROVEITAMENTO: Se atingir 85%, a barra completa 100% visualmente
            const aproveitamentoReal = (heroi.pontos / heroi.totalSemana) * 100;
            const porcentagemParaBarra = Math.min((aproveitamentoReal / 85) * 100, 100);
            
            return (
              <motion.div
                key={heroi.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-5 rounded-[32px] border-4 transition-all relative ${
                  isMe 
                  ? 'bg-white border-[#5D00FF] shadow-[0_10px_0_0_#5D00FF10]' 
                  : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-sm ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900 rotate-3' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {index === 0 ? <Trophy size={20} /> : index + 1}
                    </div>
                    <div>
                      <span className="font-black text-sm uppercase text-slate-700 block leading-none">
                        {heroi.nome} {isMe && "⭐"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {heroi.pontos} de {heroi.totalSemana} pts
                      </span>
                    </div>
                  </div>
                  
                  {aproveitamentoReal >= 85 && (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                       <Target className="text-green-500" size={24} />
                    </motion.div>
                  )}
                </div>

                {/* BARRA DE PROGRESSO COM MARCADORES DE META */}
                <div className="relative pt-2 pb-6">
                  {/* Fundo da Barra */}
                  <div className={`w-full h-4 rounded-full overflow-hidden relative ${isMe ? 'bg-slate-100' : 'bg-slate-50'}`}>
                    
                    {/* Linhas das Metas (50% e 70%) baseadas na regra de 85% ser o topo */}
                    {/* A posição é calculada como: (ValorMeta / 85) * 100 */}
                    <div className="absolute top-0 left-[58.8%] w-0.5 h-full bg-white/50 z-10" title="Meta 50%" />
                    <div className="absolute top-0 left-[82.3%] w-0.5 h-full bg-white/50 z-10" title="Meta 70%" />

                    {/* Preenchimento Dinâmico */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentagemParaBarra}%` }}
                      className={`h-full transition-colors ${
                        aproveitamentoReal >= 85 ? 'bg-green-500' : 
                        aproveitamentoReal >= 70 ? 'bg-blue-500' : 
                        aproveitamentoReal >= 50 ? 'bg-orange-500' : 'bg-[#5D00FF]'
                      }`}
                    />
                  </div>

                  {/* Legendas dos Marcadores abaixo da barra */}
                  <div className="absolute w-full flex justify-between mt-1 px-1">
                    <span className="text-[8px] font-black text-slate-300">0%</span>
                    <span className={`text-[8px] font-black absolute left-[58.8%] -translate-x-1/2 ${aproveitamentoReal >= 50 ? 'text-orange-500' : 'text-slate-300'}`}>50%</span>
                    <span className={`text-[8px] font-black absolute left-[82.3%] -translate-x-1/2 ${aproveitamentoReal >= 70 ? 'text-blue-500' : 'text-slate-300'}`}>70%</span>
                    <span className={`text-[8px] font-black right-0 ${aproveitamentoReal >= 85 ? 'text-green-500 font-black scale-110' : 'text-slate-300'}`}>100%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cabeçalho de Progresso do Dia */}
      <div className="flex items-center justify-between bg-[#5D00FF] p-6 rounded-[40px] shadow-xl text-white">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Missões de Hoje</span>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Vamos nessa, {nomeFilho}!</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-2xl font-black leading-none">
                {progressoDia?.realizado}<span className="text-purple-300 text-sm">/{progressoDia?.total}</span>
             </p>
             <span className="text-[9px] font-black uppercase text-purple-200">Pontos</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-xs font-black text-[#5D00FF]">{porcentagemDia}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {tarefas.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
            <p className="font-black text-slate-400 uppercase text-xs">Dia de descanso! Aproveite! 😎</p>
          </div>
        ) : (
          tarefas.map((tarefa: any) => {
            const feito = tarefa.concluido;
            return (
              <motion.div 
                key={tarefa.id} 
                className={`bg-white p-5 rounded-[32px] border-2 transition-all relative ${
                  feito ? 'border-green-100 opacity-70 scale-[0.98]' : 'border-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`transition-all ${feito ? 'text-green-500' : 'text-slate-100'}`}>
                    {feito ? <CheckCircle2 size={40} fill="#22C55E10" /> : <Circle size={40} strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-slate-800 text-sm uppercase tracking-tight ${feito ? 'line-through opacity-30' : ''}`}>
                      {tarefa.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg font-black text-[10px]">
                         {tarefa.points} PTS
                       </span>
                       {feito && <span className="text-green-600 font-black text-[10px] uppercase">Concluído!</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}