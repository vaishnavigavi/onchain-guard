// frontend/components/NavBar.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

// Define Ethereum provider interface
interface EthereumProvider {
  request: (args: { 
    method: string; 
    params?: string[] 
  }) => Promise<string>;
  selectedAddress: string;
}

// Extend window with Ethereum provider
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Define session type
interface Session {
  address?: string;
}

export function NavBar() {
  const { data: session } = useSession();
  const [chainId, setChainId] = useState<number>();
  const address = (session as Session)?.address;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_chainId" })
        .then((id: string) => setChainId(parseInt(id, 16)));
    }
  }, []);

  const handleLogin = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    // request a SIWE message from your own API route
    const messageRes = await fetch("/api/auth/ethereum/message");
    const { message } = await messageRes.json();
    // have the user sign it
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, window.ethereum.selectedAddress],
    });
    // hand it off to NextAuth
    await signIn("credentials", { message, signature });
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex space-x-4">
        <Link href="/">Home</Link>
        <Link href="/anomalies">Anomalies</Link>
      </div>
      <div className="flex items-center space-x-4">
        {chainId != null && <span>Chain ID: {chainId}</span>}
        
      </div>
    </nav>
  );
}
