"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";

export default function Home() {
  const { currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-primary font-bold">Carregando...</div>
    </div>
  );
}