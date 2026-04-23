"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Calendar, DollarSign, Save, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateWeeklyAllowance } from "@/app/actions/userActions";

export default function ExtratoMensalClient({ 
  filhos, 
  extrato, 
  userIdAtivo, 
  mesadaSalva, 
  mesNome 
}: any) {
  const router = useRouter();
  const [valorMesada, setValorMesada] = useState(mesadaSalva || 0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setValorMesada(mesadaSalva);
  }, [mesadaSalva, userIdAtivo]);

  const handleSalvarMesada = async () => {
    try {
      setSalvando(true);
      await updateWeeklyAllowance(userIdAtivo, valorMesada);
      router.refresh();
    } catch (error) {
      alert("Erro ao salvar o valor da mesada.");
    } finally {
      setSalvando(false);
    }
  };

  const calcularResumoSemana = (tarefasSemana: any[]) => {
    const ganho = tarefasSemana.filter(t => t.status === 'CONCLUIDO').reduce((acc, t) => acc + t.points, 0);
    const possivel = tarefasSemana.reduce((acc, t) => acc + t.points, 0);
    const aproveitamento = possivel > 0 ? ganho / possivel : 0;
    
    // LÓGICA DE METAS FIXAS (DEGRAUS)
    let valorParaPagar = 0;
    let metaAtingida = "0%";

    if (aproveitamento >= 0.85) {
      valorParaPagar = valorMesada;
      metaAtingida = "100%";
    } else if (aproveitamento >= 0.7) {
      valorParaPagar = valorMesada * 0.7;
      metaAtingida = "70%";
    } else if (aproveitamento >= 0.5) {
      valorParaPagar = valorMesada * 0.5;
      metaAtingida = "50%";
    }

    return { ganho, possivel, aproveitamento, valorParaPagar, metaAtingida };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push('/dashboard/pais')}
          className="p-3 bg-white rounded-2xl shadow-sm text-[#5D00FF] hover:bg-purple-50 transition-all border border-slate-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 suppressHydrationWarning className="text-xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-2">
          <Calendar className="text-[#5D00FF]" size={20} /> Extrato da Semana
        </h1>
        <div className="w-12" /> 
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* SELETOR DE FILHOS */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {filhos.map((f: any) => (
            <button
              key={f.id}
              onClick={() => router.push(`/dashboard/pais/mensal?userId=${f.id}`)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase transition-all whitespace-nowrap border-2 ${
                userIdAtivo === f.id ? 'bg-[#5D00FF] text-white border-[#5D00FF] shadow-lg' : 'bg-white text-slate-400 border-white'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* CONFIGURAÇÃO DA MESADA */}
        <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mesada Semanal (100%)</p>
              <div className="flex items-center gap-2 font-black text-2xl text-slate-800">
                <span className="text-slate-300">R$</span>
                <input 
                  type="number" 
                  value={valorMesada}
                  onChange={(e) => setValorMesada(Number(e.target.value))}
                  className="w-24 outline-none text-[#5D00FF] focus:bg-purple-50 rounded-lg px-1 transition-all"
                />
                <button 
                  onClick={handleSalvarMesada}
                  disabled={salvando || valorMesada === mesadaSalva}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    valorMesada !== mesadaSalva 
                    ? 'bg-green-500 text-white shadow-md active:scale-95' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Save size={14} />
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LISTAGEM POR SEMANAS */}
        <div className="space-y-12">
          {/* Ordenamos as chaves para garantir que a lista siga a ordem cronológica correta */}
          {Object.keys(extrato).sort((a, b) => Number(a) - Number(b)).map((labelSemana) => {
            const resumo = calcularResumoSemana(extrato[labelSemana]);
            if (extrato[labelSemana].length === 0) return null;

            const dataInicio = new Date(Number(labelSemana));
            const dataFim = new Date(dataInicio.getTime() + 6 * 24 * 60 * 60 * 1000);
            const formatarDataLocal = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
              <section key={labelSemana} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                
                {/* CABEÇALHO SEMANA */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                  <div>
                    <h3 suppressHydrationWarning className="font-black text-slate-800 uppercase tracking-tighter text-xl leading-tight">
                      Semana {formatarDataLocal(dataInicio)} a {formatarDataLocal(dataFim)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${resumo.valorParaPagar > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {resumo.valorParaPagar > 0 ? `🏆 Meta ${resumo.metaAtingida} Alcançada` : '🚀 Continue tentando!'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-3xl text-right min-w-[140px] shadow-xl border-b-4 border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Prêmio da Meta</p>
                    <p className="text-2xl font-black text-green-400 leading-none tracking-tighter">
                      R$ {resumo.valorParaPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* PÓDIO DE METAS - CORES VIBRANTES */}
                <div className="grid grid-cols-3 gap-4 h-40 items-end px-4">
                  
                  {/* META 50% - LARANJA SOLAR */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.p 
                      animate={resumo.aproveitamento >= 0.5 && resumo.aproveitamento < 0.7 ? { scale: 1.1, y: -5 } : { scale: 1 }}
                      className={`text-[11px] font-black transition-all ${resumo.aproveitamento >= 0.5 ? 'text-orange-500' : 'text-slate-300'}`}
                    >
                      R$ {(valorMesada * 0.5).toFixed(2)}
                    </motion.p>
                    <div className={`w-full rounded-t-2xl border-b-0 border-4 transition-all duration-700 ${
                      resumo.aproveitamento >= 0.5 
                        ? 'bg-gradient-to-t from-orange-500 to-yellow-400 border-orange-600 h-20 shadow-[0_10px_0_0_rgba(249,115,22,0.2)]' 
                        : 'bg-slate-100 border-slate-200 h-10'
                    }`}></div>
                    <p className={`text-[10px] font-black uppercase ${resumo.aproveitamento >= 0.5 ? 'text-orange-600' : 'text-slate-400'}`}>50%</p>
                  </div>

                  {/* META 100% - VERDE NEON (CENTRO) */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.p 
                      animate={resumo.aproveitamento >= 1 ? { scale: 1.2, y: -10 } : { scale: 1 }}
                      className={`text-[12px] font-black transition-all ${resumo.aproveitamento >= 0.85 ? 'text-green-500' : 'text-slate-300'}`}
                    >
                      R$ {(valorMesada).toFixed(2)}
                    </motion.p>
                    <div className={`w-full rounded-t-2xl border-b-0 border-4 relative transition-all duration-700 ${
                      resumo.aproveitamento >= 0.85
                        ? 'bg-gradient-to-t from-green-500 to-lime-400 border-green-600 h-32 shadow-[0_10px_0_0_rgba(34,197,94,0.3)]' 
                        : 'bg-slate-100 border-slate-200 h-10'
                    }`}>
                        {resumo.aproveitamento >= 0.85 && (
                          <motion.div 
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full"
                          >
                            <Trophy className="text-yellow-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.1)]" size={36} fill="currentColor" />
                          </motion.div>
                        )}
                    </div>
                    <p className={`text-[10px] font-black uppercase ${resumo.aproveitamento >= 0.85 ? 'text-green-600' : 'text-slate-400'}`}>100%</p>
                  </div>

                  {/* META 70% - AZUL ELÉTRICO */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.p 
                      animate={resumo.aproveitamento >= 0.7 && resumo.aproveitamento < 1 ? { scale: 1.1, y: -5 } : { scale: 1 }}
                      className={`text-[11px] font-black transition-all ${resumo.aproveitamento >= 0.7 ? 'text-blue-500' : 'text-slate-300'}`}
                    >
                      R$ {(valorMesada * 0.7).toFixed(2)}
                    </motion.p>
                    <div className={`w-full rounded-t-2xl border-b-0 border-4 transition-all duration-700 ${
                      resumo.aproveitamento >= 0.7 
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 border-blue-700 h-24 shadow-[0_10px_0_0_rgba(37,99,235,0.2)]' 
                        : 'bg-slate-100 border-slate-200 h-10'
                    }`}></div>
                    <p className={`text-[10px] font-black uppercase ${resumo.aproveitamento >= 0.7 ? 'text-blue-600' : 'text-slate-400'}`}>70%</p>
                  </div>
                </div>

                {/* INDICADOR DE POSIÇÃO ATUAL */}
                <div className="relative pt-6">
                    <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(resumo.aproveitamento * 100, 100)}%` }}
                            className={`h-full transition-colors ${
                              resumo.aproveitamento >= 1 ? 'bg-green-500' : 
                              resumo.aproveitamento >= 0.7 ? 'bg-blue-500' : 
                              resumo.aproveitamento >= 0.5 ? 'bg-orange-500' : 'bg-slate-300'
                            }`}
                        />
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Progresso do Herói: {Math.round(resumo.aproveitamento * 100)}%</span>
                         <span className="text-[10px] font-black text-blue-600 uppercase italic">
                           {resumo.aproveitamento >= 1 ? "Incrível! Tudo Feito!" : `Faltam ${resumo.possivel - resumo.ganho} pts para a próxima meta`}
                         </span>
                    </div>
                </div>

                {/* LISTA DE MISSÕES - Mostra todas as tarefas da semana projetadas pelo servidor */}
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Detalhamento das Missões (Semana Completa)</p>
                  {/* Ordenamos por data para facilitar a leitura da semana */}
                  {extrato[labelSemana].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item: any) => {
                    const isConcluido = item.status === 'CONCLUIDO';
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-[28px] border-2 flex items-center justify-between bg-white transition-all ${
                          isConcluido ? 'border-slate-50 shadow-sm' : 'border-dashed border-slate-100 bg-slate-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-2xl ${isConcluido ? 'bg-green-100 text-green-500' : 'bg-slate-100 text-slate-300'}`}>
                            {isConcluido ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                          </div>
                          <div>
                            <p className={`font-black text-[13px] uppercase tracking-tight leading-tight ${isConcluido ? 'text-slate-700' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                            <p suppressHydrationWarning className="text-[9px] font-black text-slate-400 uppercase mt-0.5">
                              {new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${isConcluido ? 'text-[#5D00FF]' : 'text-slate-200'}`}>
                            {item.points} pts
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}