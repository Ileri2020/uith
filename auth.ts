// @ts-nocheck
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },

  providers: [
    // ✅ Google OAuth
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    // ✅ Credentials login
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Please provide both email & password");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password)
          throw new Error("Invalid email or password");

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) throw new Error("Invalid email or password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
          contact: user.contact,
          avatarUrl: user.avatarUrl,
          department: user.department,
          sex: user.sex,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const googleId = user.id || user.email;
            const image =
              user.image?.replace(/=s\d+(-c)?/, "=s250-c") ?? user.image;

            await prisma.user.create({
              data: {
                name: user.name ?? "",
                email: user.email,
                avatarUrl: image,
                password: await bcrypt.hash(
                  googleId,
                  parseInt(process.env.SALT_ROUNDS ?? "10")
                ),
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }

      if (account?.provider === "credentials") {
        return true;
      }

      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
