"use client";

import { useAuth } from "@/features/auth/auth-context";
import { LoginModal } from "@/components/modals/LoginModal";
import { CompleteProfileModal } from "@/components/modals/CompleteProfileModal";

export function GlobalModals() {
  const { isLoginOpen, setIsLoginOpen } = useAuth();

  return (
    <>
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <CompleteProfileModal />
    </>
  );
}
