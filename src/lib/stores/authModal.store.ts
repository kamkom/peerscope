import { create } from "zustand";

type AuthView = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  openModal: (view: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",
  openModal: (view) => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
