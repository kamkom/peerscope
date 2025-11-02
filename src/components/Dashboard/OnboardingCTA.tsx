import React from "react";
import { Button } from "@/components/ui/button";

const OnboardingCTA = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h2 className="mt-6 text-xl font-semibold">Stwórz swój profil</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Aby w pełni wykorzystać możliwości aplikacji, zacznij od stworzenia swojego profilu postaci.
      </p>
      <a href="/characters/new" className="mt-6">
        <Button>Stwórz swój profil</Button>
      </a>
    </div>
  );
};

export default OnboardingCTA;
