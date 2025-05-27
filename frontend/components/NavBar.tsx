// frontend/components/NavBar.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define session type
interface Session {
  user?: {
    address?: string;
  };
}

export function NavBar() {
  const { data: session } = useSession();
  const [chainId, setChainId] = useState<number>();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then((id: string) => {
        setChainId(parseInt(id, 16));
      });
    }
  }, []);

  const handleLogin = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const messageRes = await fetch("/api/auth/ethereum/message");
    const { message } = await messageRes.json();
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, window.ethereum.selectedAddress],
    });
    await signIn("credentials", { message, signature });
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/anomalies" className="hover:underline">Anomalies</Link>
      </div>
      <div className="flex items-center space-x-4">
        {chainId && <span>Chain ID: {chainId}</span>}
        {session?.user?.address ? (
          <>
            <Link href={`/wallet/${session.user.address}`} className="font-mono hover:underline">
              {session.user.address}
            </Link>
            <button onClick={() => signOut()} className="underline">
              Sign out
            </button>
          </>
        ) : (
          <button onClick={handleLogin} className="underline">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
