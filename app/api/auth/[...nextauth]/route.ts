// app/api/auth/[...nextauth]/route.ts
import { buildServerApiUrl } from "@/lib/api/config";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

if (
  process.env.NODE_ENV !== "production" &&
  !process.env.NEXTAUTH_URL &&
  !process.env.AUTH_TRUST_HOST
) {
  process.env.AUTH_TRUST_HOST = "true";
}

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "revboostai-local-dev-auth-secret-change-me";

type LoginErrorResponse = {
  detail?: string;
  error?: string;
  is_verified?: boolean;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: {
    id: number | string;
    full_name: string;
    email: string;
    role: string;
    is_profile_completed?: boolean;
  };
};

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(buildServerApiUrl("/api/auth/login/"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const error = (await res.json().catch(() => null)) as
              | LoginErrorResponse
              | null;

            if (error?.is_verified === false) {
              throw new Error("EmailNotVerified");
            }

            throw new Error(
              error?.detail || error?.error || "Invalid credentials"
            );
          }

          const data = (await res.json()) as LoginResponse;

          // Return shape maps to the token callback below
          return {
            id: String(data.user.id),
            name: data.user.full_name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.access,
            refreshToken: data.refresh,
            isProfileCompleted: data.user.is_profile_completed === true,
          };
        } catch (error: unknown) {
          throw new Error(error instanceof Error ? error.message : "Login failed");
        }
      },
    }),
  ],

  callbacks: {
    // Persist tokens into the JWT cookie
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.isProfileCompleted = user.isProfileCompleted;
      }

      if (
        trigger === "update" &&
        typeof session?.isProfileCompleted === "boolean"
      ) {
        token.isProfileCompleted = session.isProfileCompleted;
      }

      // TODO: Add token refresh logic here when access token expires
      return token;
    },

    // Expose only safe fields to the client session
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      session.isProfileCompleted =
        typeof token.isProfileCompleted === "boolean"
          ? token.isProfileCompleted
          : undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,  // 30 days
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
