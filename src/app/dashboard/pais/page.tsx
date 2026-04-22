"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Trophy, Calendar, PlusCircle, TrendingUp, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardPais() {
  const { data: session, status } = useSession();

  // 1. Proteção de Rota no Cliente
  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center font-black text-blue-500 animate-pulse">CARREGANDO... 🚀</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans pb-10">
      {/* Navbar Superior Divertida */}
      <nav className="bg-white p-4 shadow-md border-b-4 border-yellow-400 flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Trophy size={24} />
          </div>
          <span className="font-black text-blue-900 text-xl tracking-tighter">APP KIDS <span className="text-blue-400">PAINEL</span></span>
        </div>
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={18} /> Sair
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {/* Boas Vindas */}
        <header className="mb-10 text-center md:text-left">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-black text-slate-800"
          >
            Olá, Família <span className="text-blue-600 uppercase">Gazzola!</span> 👋
          </motion.h1>
          <p className="text-slate-500 font-medium">O que vamos gerenciar hoje?</p>
        </header>

        {/* Grid de Atalhos Rápidos */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Novo Acordo", icon: <PlusCircle />, color: "bg-green-500" },
            { label: "Extratos", icon: <Calendar />, color: "bg-purple-500" },
            { label: "Ranking", icon: <TrendingUp />, color: "bg-orange-500" },
            { label: "Equipe", icon: <Users />, color: "bg-blue-500" },
          ].map((item, i) => (
            <motion.button
              whileHover={{ y: -5 }}
              key={i}
              className={`${item.color} p-4 rounded-3xl text-white shadow-lg flex flex-col items-center gap-2 transition-all`}
            >
              {item.icon}
              <span className="font-black text-xs uppercase">{item.label}</span>
            </motion.button>
          ))}
        </section>

        {/* Área dos Filhos (Os pequenos heróis) */}
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Seus Heróis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Pedro */}
          <FilhoCard 
            nome="Pedro" 
            cor="bg-blue-100" 
            borderColor="border-blue-400" 
            btnColor="bg-blue-500"
            pontos={120}
            meta={200}
          />
          
          {/* Card Gabriel */}
          <FilhoCard 
            nome="Gabriel" 
            cor="bg-orange-100" 
            borderColor="border-orange-400" 
            btnColor="bg-orange-500"
            pontos={85}
            meta={200}
          />
        </div>
      </main>
    </div>
  );
}

// Sub-componente para os cards dos filhos
function FilhoCard({ nome, cor, borderColor, btnColor, pontos, meta }: any) {
  const progresso = (pontos / meta) * 100;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`${cor} rounded-[40px] p-8 border-b-8 ${borderColor} relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800">{nome}</h3>
          <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-black uppercase text-slate-600">
            Nível 5
          </span>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-slate-800">{pontos}</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Pontos Totais</p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-black mb-2 text-slate-600 uppercase">
          <span>Progresso da Semana</span>
          <span>{pontos}/{meta}</span>
        </div>
        <div className="w-full h-6 bg-white/50 rounded-full overflow-hidden p-1 border-2 border-white">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            className={`h-full ${btnColor} rounded-full`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className={`py-3 rounded-2xl text-white font-black text-sm shadow-md ${btnColor} hover:brightness-110`}>
          VER TAREFAS
        </button>
        <button className="py-3 rounded-2xl bg-white text-slate-600 font-black text-sm shadow-md hover:bg-slate-50">
          EXTRATO
        </button>
      </div>
    </motion.div>
  );
}