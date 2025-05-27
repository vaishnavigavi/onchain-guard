// frontend/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** The on‐chain wallet address from SIWE */
      address?: string;
    } & DefaultSession["user"];
  }
}
