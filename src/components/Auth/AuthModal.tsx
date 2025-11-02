"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthModalStore } from "@/lib/stores/authModal.store";
import { LoginForm } from "./LoginForm";
import { RegistrationForm } from "./RegistrationForm";

export function AuthModal() {
  const { isOpen, view, closeModal } = useAuthModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{view === "login" ? "Logowanie" : "Rejestracja"}</DialogTitle>
          <DialogDescription>
            {view === "login"
              ? "Zaloguj się, aby uzyskać dostęp do swojego konta."
              : "Stwórz konto, aby rozpocząć korzystanie z aplikacji."}
          </DialogDescription>
        </DialogHeader>
        {view === "login" ? <LoginForm /> : <RegistrationForm />}
      </DialogContent>
    </Dialog>
  );
}
