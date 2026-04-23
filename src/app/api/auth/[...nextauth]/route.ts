import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          familyId: user.familyId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.familyId = (user as any).familyId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.familyId = token.familyId;
        session.user.id = token.id;
      }
      return session;
    },
    // ADICIONADO: Força o redirecionamento para o login em logouts
    async redirect({ url, baseUrl }) {
      // Se a URL contém o comando de signout, manda para /login
      if (url.includes("signout")) return `${baseUrl}/login`;
      
      // Permite redirecionamentos relativos (dentro do seu site)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Permite redirecionamentos para a mesma origem (IP ou domínio)
      else if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/login", // ADICIONADO: Define a página de logout
    error: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };