import CredentialsProvider from "next-auth/providers/credentials";
import { getUserdb } from "./server/server";
import NextAuth, { type NextAuthOptions } from "next-auth";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CredentialsProvider({

      name: "Credentials",

      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const email = credentials?.email 
        const password = credentials?.password
        if (!email || !password) {
          throw new Error("Invalid credentials")
        }
        
        const result = await getUserdb(email, password);

        if (result.user && result.isValid) {
          return { id: result.user.id, email: result.user.email, name: result.user.email };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
}