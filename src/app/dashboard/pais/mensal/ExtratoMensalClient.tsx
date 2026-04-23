"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExtratoItem {
  id: string;
  description: string;
  points: number;
  date: Date;
  status: 'CONCLUIDO' | 'NAO_FEITO';
}

export default function ExtratoMensalClient({ 
  filhos, 
  extrato, 
  userIdAtivo, 
  mesNome 
}: any) {
  const router = useRouter();

  // Cálculo do total de pontos (apenas o que foi concluído)
  const totalPontosMes = Object.values(extrato).flat()
    .filter((i: any) => i.status === 'CONCLUIDO')
    .reduce((acc: number, curr: any) => acc + curr.points, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans">
      
      {/* HEADER E VOLTAR */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push('/dashboard/pais')}
          className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} /> Extrato de {mesNome}
        </h1>
        <div className="w-12" /> 
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* SELETOR DE FILHOS (O QUE ESTAVA FALTANDO) */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {filhos.map((filho: any) => (
            <button
              key={filho.id}
              onClick={() => router.push(`/dashboard/pais/mensal?userId=${filho.id}`)}
              className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase transition-all whitespace-nowrap shadow-sm border-2 ${
                userIdAtivo === filho.id 
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-blue-200' 
                  : 'bg-white text-slate-400 border-white hover:border-blue-200'
              }`}
            >
              {filho.name}
            </button>
          ))}
        </div>

        {/* CARD DE RESUMO MENSAL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
        >
          <TrendingUp className="absolute right-[-5%] top-[-10%] opacity-10" size={180} />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Saldo total do mês</p>
          <h2 className="text-6xl font-black tracking-tighter">
            {totalPontosMes} <span className="text-2xl text-yellow-400">pts</span>
          </h2>
        </motion.div>

        {/* LISTAGEM POR SEMANAS */}
        <div className="space-y-10">
          {Object.keys(extrato).sort((a, b) => Number(b) - Number(a)).map((semana) => (
            <section key={semana}>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white border border-slate-200 text-slate-500 px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-sm">
                  Semana {semana}
                </div>
                <div className="flex-1 h-[2px] bg-slate-200/50" />
              </div>

              <div className="space-y-3">
                {extrato[semana].map((item: any) => {
                  const isConcluido = item.status === 'CONCLUIDO';

                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-5 rounded-[32px] border flex items-center justify-between transition-all bg-white ${
                        isConcluido ? 'border-slate-100 shadow-sm' : 'border-red-100 bg-red-50/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          isConcluido ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                        }`}>
                          {isConcluido ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                        </div>
                        <div>
                          <p className={`font-black text-sm uppercase tracking-tight ${
                            isConcluido ? 'text-slate-700' : 'text-red-900'
                          }`}>
                            {item.description}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-black text-xl ${
                          isConcluido ? 'text-green-600' : 'text-red-400'
                        }`}>
                          {isConcluido ? `+${item.points}` : '0'}
                        </p>
                        {!isConcluido && (
                          <span className="text-[8px] font-black text-red-400 uppercase block">Pendente</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}