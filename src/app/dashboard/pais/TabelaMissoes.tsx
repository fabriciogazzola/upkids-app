"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Star, Trash2, User, ArrowLeft, Sun, CloudSun, Moon } from "lucide-react";
import { toggleTarefaAction, deletarTarefaAction } from "./actions";
import { useRouter } from "next/navigation";

export default function TabelaMissoes({ tarefas = [], dataAtual, viewingUserId, progressoDia }: any) {
  const router = useRouter();
  const diasAbreviados = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
  
  // Garantir que a data seja tratada corretamente sem bugs de fuso horário local
  const dataRef = new Date(dataAtual + "T12:00:00");
  const diaSelecionadoIndex = dataRef.getDay();

  const infoPeriodo: any = {
    MANHA: { icon: <Sun size={12} />, label: "Manhã", color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    TARDE: { icon: <CloudSun size={12} />, label: "Tarde", color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    NOITE: { icon: <Moon size={12} />, label: "Noite", color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" }
  };

  const mudarDia = (diaNome: string) => {
    const mapa: any = { "DOM": 0, "SEG": 1, "TER": 2, "QUA": 3, "QUI": 4, "SEX": 5, "SAB": 6 };
    const alvo = mapa[diaNome];
    const d = new Date(dataRef);
    const diff = alvo === 0 ? (diaSelecionadoIndex === 0 ? 0 : 7 - diaSelecionadoIndex) : (alvo - diaSelecionadoIndex);
    d.setDate(dataRef.getDate() + diff);
    router.push(`/dashboard/pais?date=${d.toISOString().split('T')[0]}&tab=missoes&userId=${viewingUserId}`);
  };

  const handleDeletar = async (taskId: string, description: string) => {
    if (confirm(`Tem certeza que deseja deletar a missão "${description}"?`)) {
      await deletarTarefaAction(taskId);
    }
  };

  const diasMapa: any = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SAB", 0: "DOM" };

  const porcentagemDia = progressoDia?.total > 0 
    ? Math.round((progressoDia.realizado / progressoDia.total) * 100) 
    : 0;

  const periodosUnicos = ["MANHA", "TARDE", "NOITE"];

  return (
    <div className="space-y-6">
      {/* Header e Placar */}
      <div className="flex items-center justify-between gap-3">
        <button 
          onClick={() => router.push('/dashboard/pais')}
          className="flex items-center gap-2 text-[#5D00FF] font-black text-[15px] uppercase bg-white px-5 py-3 rounded-full shadow-sm border border-slate-100 active:scale-95 transition-all"
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <div className="bg-white pl-4 pr-2 py-1.5 rounded-full shadow-sm border border-slate-50 flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-slate-800 leading-none mt-1">
              {progressoDia?.realizado}<span className="text-slate-300 text-[20px]">/{progressoDia?.total}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white shadow-sm">
             <span className="text-[15px] font-black text-blue-600">
               {porcentagemDia}%
             </span>
          </div>
        </div>
      </div>

      {/* Régua de Dias */}
      <div className="flex justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar gap-1">
        {diasAbreviados.map((dia) => {
          const mapaDias: any = { "DOM": 0, "SEG": 1, "TER": 2, "QUA": 3, "QUI": 4, "SEX": 5, "SAB": 6 };
          const isAtivo = mapaDias[dia] === diaSelecionadoIndex;
          return (
            <button
              key={dia}
              onClick={() => mudarDia(dia)}
              className={`flex-1 min-w-[42px] py-3 rounded-xl font-black text-[10px] transition-all ${
                isAtivo ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              {dia}
            </button>
          );
        })}
      </div>

      {/* Listagem de Tarefas */}
      <div className="space-y-8">
        {tarefas.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] py-10 text-center">
             <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Nenhuma missão hoje</p>
          </div>
        ) : (
          periodosUnicos.map((periodoKey) => {
            // Filtro robusto para evitar erros de case-sensitive
            const tarefasDoPeriodo = tarefas.filter((t: any) => 
              t.period?.toUpperCase() === periodoKey
            );

            if (tarefasDoPeriodo.length === 0) return null;

            const info = infoPeriodo[periodoKey];

            return (
              <div key={periodoKey} className="space-y-4">
                <div className="flex items-center gap-2 pl-2">
                  <div className={`${info.color} p-1.5 rounded-lg border ${info.border}`}>
                    {info.icon}
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-wider italic">
                    Missões da {info.label}
                  </h3>
                  <div className="flex-1 h-[1px] bg-slate-100 ml-2" />
                </div>

                <div className="space-y-3">
                  {tarefasDoPeriodo.map((tarefa: any) => {
                    // CORREÇÃO: Busca o filho ou assume o viewingUserId caso a relação não tenha vindo completa do servidor
                    const filhoVinculado = tarefa.assignedTo?.find((f: any) => f.id === viewingUserId);
                    const nomeExibicao = filhoVinculado?.name || "Herói";
                    
                    // Se a tarefa não estiver vinculada a esse ID e o servidor não pré-filtrou, não exibe
                    if (tarefa.assignedTo && !filhoVinculado) return null;

                    const feito = tarefa.concluintesIds?.includes(viewingUserId);
                    const diasTarefaArray = tarefa.diasSemana ? tarefa.diasSemana.split(",") : [];

                    return (
                      <motion.div 
                        key={tarefa.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 flex items-start gap-4 relative min-h-[100px]"
                      >
                        <button
                          onClick={() => toggleTarefaAction(tarefa.id, viewingUserId, dataAtual, !feito)}
                          className={`flex-shrink-0 mt-1 transition-all ${feito ? 'text-[#1DDF6F]' : 'text-slate-100'}`}
                        >
                          {feito ? <CheckCircle2 size={36} fill="#1DDF6F20" /> : <Circle size={36} strokeWidth={1.5} />}
                        </button>

                        <div className="flex-1 min-w-0 pr-10">
                          <h4 className={`font-black text-[#0F172A] text-sm uppercase tracking-tight break-words leading-relaxed ${feito ? 'line-through text-slate-300' : ''}`}>
                            {tarefa.description}
                          </h4>
                          
                          <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                            <div className="bg-blue-50 text-[#5D00FF] px-2 py-0.5 rounded-lg font-black text-[9px] uppercase flex items-center gap-1">
                              <User size={10} /> {nomeExibicao}
                            </div>
                            <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg font-black text-[9px] uppercase flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> {tarefa.points} pts
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {[1, 2, 3, 4, 5, 6, 0].map(diaNum => (
                              <span 
                                key={diaNum}
                                className={`px-2 py-1 rounded-md font-black text-[8px] transition-colors ${
                                  diasTarefaArray.includes(diaNum.toString())
                                  ? 'bg-[#BC00DD] text-white' 
                                  : 'bg-slate-50 text-slate-200'
                                }`}
                              >
                                {diasMapa[diaNum]}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeletar(tarefa.id, tarefa.description)}
                          className="absolute right-4 top-4 bg-red-50 p-2.5 rounded-2xl text-red-400 active:bg-red-500 active:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}