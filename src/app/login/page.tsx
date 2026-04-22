"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Para animações
import { Rocket, Lock, Mail, Star, Sun } from "lucide-react"; // Ícones divertidos

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) setError("Ops! Email ou senha errados. Tente de novo! ✌️");
    else {
      router.push("/dashboard/pais");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Elementos flutuantes de fundo */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 left-10 text-yellow-300 opacity-50"><Sun size={80} /></motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-20 right-10 text-white opacity-30"><Star size={60} /></motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="bg-white p-8 rounded-[40px] shadow-[0_20px_0_0_rgba(0,0,0,0.1)] w-full max-w-md border-8 border-yellow-300 relative"
      >
        {/* Ícone de foguete no topo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 p-4 rounded-full border-8 border-white shadow-lg">
          <Rocket className="text-blue-600" size={40} />
        </div>

        <h1 className="text-4xl font-black text-center text-blue-600 mb-2 mt-4 tracking-tighter">
          APP KIDS
        </h1>
        <p className="text-center text-purple-400 font-bold mb-8 italic">🚀 Área Secreta da Família</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-black text-blue-900 mb-2 ml-1 uppercase">Email do Papai ou Mamãe</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-4 border-blue-50 bg-blue-50 text-blue-900 font-bold placeholder:text-blue-300 focus:border-yellow-400 focus:bg-white outline-none transition-all text-lg"
                placeholder="exemplo@email.com"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-black text-blue-900 mb-2 ml-1 uppercase">Senha Secreta</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-4 border-blue-50 bg-blue-50 text-blue-900 font-bold placeholder:text-blue-300 focus:border-yellow-400 focus:bg-white outline-none transition-all text-lg"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
  <motion.p 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      x: [-4, 4, -4, 4, 0] // Efeito de tremer no eixo X
    }}
    transition={{ duration: 0.4 }}
    className="text-red-500 text-sm font-black text-center bg-red-50 p-2 rounded-lg"
  >
    {error}
  </motion.p>
)}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black py-5 rounded-[25px] shadow-[0_8px_0_0_#ca8a04] active:shadow-none active:translate-y-2 transition-all text-xl uppercase tracking-wider"
          >
            VAMOS ENTRAR! 🎈
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}