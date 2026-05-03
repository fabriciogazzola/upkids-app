"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { criarTarefaAction } from "@/app/dashboard/pais/actions";

export default function ModalNovaTarefa({ filhos, familyId, onClose }: any) {
  const [descricao, setDescricao] = useState("");
  const [pontos, setPontos] = useState(""); // Começa vazio para mostrar o placeholder
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [dias, setDias] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [period, setPeriod] = useState("MANHA");

const diasMapa = [
  { id: 0, label: "DOM" }, { id: 1, label: "SEG" }, { id: 2, label: "TER" },
  { id: 3, label: "QUA" }, { id: 4, label: "QUI" }, { id: 5, label: "SEX" }, { id: 6, label: "SAB" }
];

  const handleSalvar = async () => {
    if (!descricao || selecionados.length === 0 || dias.length === 0 || !pontos) {
        alert("Ops! Preencha a descrição, pontos, escolha pelo menos um herói e um dia!");
        return;
    }
    setLoading(true);
    await criarTarefaAction({
      descricao,
      pontos: Number(pontos),
      filhosIds: selecionados,
      diasSemana: dias.join(","),
      periodo: period,
      familyId
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter flex items-center gap-2">
            Nova Missão 🚀
          </h2>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Campo Descrição */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2 mb-1 block">O que precisa ser feito?</label>
            <input 
              type="text"
              value={descricao}
              placeholder="Ex: Arrumar o quarto"
              className="w-full p-4 rounded-2xl bg-slate-50 font-bold text-slate-700 border-2 border-transparent focus:border-blue-400 outline-none transition-all"
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Campo Pontos */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2 mb-1 block">Quantos pontos vale?</label>
            <input 
              type="number" 
              value={pontos}
              placeholder="Ex: 50"
              className="w-full p-4 rounded-2xl bg-slate-50 font-bold text-slate-700 border-2 border-transparent focus:border-blue-400 outline-none transition-all"
              onChange={(e) => setPontos(e.target.value)}
            />
          </div>

          {/* Seleção de Filhos */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2 mb-2 block">Para quais heróis?</label>
            <div className="flex gap-2">
              {filhos.map((f: any) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelecionados(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id])}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all border-2 ${selecionados.includes(f.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                >
                  {f.nome.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Dias */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2 mb-2 block">Em quais dias?</label>
            <div className="flex justify-between">
              {diasMapa.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDias(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id])}
                  className={`w-10 h-10 rounded-full font-black text-[10px] transition-all flex items-center justify-center border-2 ${dias.includes(d.id) ? 'bg-yellow-400 border-yellow-500 text-yellow-900' : 'bg-white border-slate-100 text-slate-700'}`}
                >
                  {d.label[0]}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-2">
              <label className="font-black text-slate-700 uppercase text-xs">Período da Missão</label>
              <div className="grid grid-cols-3 gap-2">
                {['MANHA', 'TARDE', 'NOITE'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`py-2 rounded-xl font-black text-[10px] border-2 transition-all ${
                      period === p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <button 
            disabled={loading}
            onClick={handleSalvar}
            className="w-full bg-[#5D00FF] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "SALVANDO..." : "CRIAR MISSÃO!"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}