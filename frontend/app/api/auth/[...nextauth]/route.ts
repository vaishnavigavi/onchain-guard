// ────────────────────────────────────────────────────────────
// Force Node.js runtime so that 'crypto' imports in next-auth
// resolve correctly (and we can use fetch)
export const runtime = "nodejs";

import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";

// 1) Your NextAuth config
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "ethereum",
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials.signature) return null;

        // parse SIWE message
        const siwe = new SiweMessage(JSON.parse(credentials.message));

        // fetch CSRF token from NextAuth’s built-in endpoint
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/csrf`,
          { cache: "no-store" }
        );
        const { csrfToken } = await res.json();

        // verify signature + domain + nonce
        const result = await siwe.verify({
          signature: credentials.signature,
          domain: new URL(process.env.NEXTAUTH_URL!).host,
          nonce: csrfToken,
        });

        if (result.success) {
          return { id: siwe.address };
        }
        return null;
      },
    }),
  ],

  // 2) session via JWT
  session: { strategy: "jwt" },

  // 3) add the wallet address into session.address
  callbacks: {
    async session({ session, token }): Promise<Session & { address?: string }> {
      return { ...session, address: token.sub as string };
    },
  },
};

// 4) create the handler
const handler = NextAuth(authOptions);

// 5) wire up GET+POST
export { handler as GET, handler as POST };
