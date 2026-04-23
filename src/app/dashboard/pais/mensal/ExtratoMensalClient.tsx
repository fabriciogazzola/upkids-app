"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Calendar, DollarSign, Wallet, Save } from "lucide-react";
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
    const valorParaPagar = aproveitamento * valorMesada;

    return { ganho, possivel, aproveitamento, valorParaPagar };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push('/dashboard/pais')}
          className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 suppressHydrationWarning className="text-xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} /> Extrato de {mesNome}
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
                userIdAtivo === f.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-white'
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mesada Semanal (Meta 100%)</p>
              <div className="flex items-center gap-2 font-black text-2xl text-slate-800">
                <span className="text-slate-300">R$</span>
                <input 
                  type="number" 
                  value={valorMesada}
                  onChange={(e) => setValorMesada(Number(e.target.value))}
                  className="w-24 outline-none text-blue-600 focus:bg-blue-50 rounded-lg px-1 transition-all"
                />
                <button 
                  onClick={handleSalvarMesada}
                  disabled={salvando || valorMesada === mesadaSalva}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    valorMesada !== mesadaSalva 
                    ? 'bg-blue-600 text-white shadow-md active:scale-95' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Save size={14} />
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
          <Wallet className="hidden md:block text-slate-100 group-hover:text-slate-200 transition-colors" size={48} />
        </section>

        {/* LISTAGEM POR SEMANAS */}
        <div className="space-y-12">
          {Object.keys(extrato).map((labelSemana) => {
            const resumo = calcularResumoSemana(extrato[labelSemana]);
            if (extrato[labelSemana].length === 0) return null;

            // --- AJUSTE DO TÍTULO DA SEMANA ---
            const dataInicio = new Date(Number(labelSemana));
            const dataFim = new Date(dataInicio.getTime() + 6 * 24 * 60 * 60 * 1000); // +6 dias para o domingo
            
            const formatarDataLocal = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
              <section key={labelSemana} className="space-y-4">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <h3 suppressHydrationWarning className="font-black text-slate-800 uppercase tracking-tighter text-lg leading-tight">
                      Semana {formatarDataLocal(dataInicio)} a {formatarDataLocal(dataFim)}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Aproveitamento: {Math.round(resumo.aproveitamento * 100)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 text-right">Valor Conquistado</p>
                    <p className="text-2xl font-black text-green-600 leading-none tracking-tighter">
                      R$ {resumo.valorParaPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${resumo.aproveitamento * 100}%` }}
                    className={`h-full ${resumo.aproveitamento >= 1 ? 'bg-green-500' : 'bg-blue-500'}`}
                  />
                </div>

                <div className="space-y-3">
                  {extrato[labelSemana].map((item: any) => {
                    const isConcluido = item.status === 'CONCLUIDO';
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-[24px] border flex items-center justify-between bg-white transition-all ${
                          isConcluido ? 'border-slate-50 shadow-sm' : 'border-red-50 bg-red-50/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isConcluido ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                            {isConcluido ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          </div>
                          <div>
                            <p className={`font-black text-[12px] uppercase tracking-tight leading-tight ${isConcluido ? 'text-slate-700' : 'text-red-900/60'}`}>
                              {item.description}
                            </p>
                            <p suppressHydrationWarning className="text-[9px] font-bold text-slate-400 uppercase">
                              {new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${isConcluido ? 'text-blue-600' : 'text-red-300 line-through'}`}>
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