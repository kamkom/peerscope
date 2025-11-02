import React, { useState, useEffect } from "react";
import type { CharacterDto } from "../../types";
import { toast } from "sonner";
import CharacterForm from "../CharacterForm";
import type { z } from "zod";
import type { createCharacterSchema } from "../../lib/schemas/character.schema";

type CharacterFormViewModel = z.infer<typeof createCharacterSchema>;

const ProfileView = () => {
  const [profile, setProfile] = useState<CharacterDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
      toast.error("Wystąpił błąd podczas wczytywania profilu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (values: CharacterFormViewModel) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile.");
      }

      toast.success("Profil zaktualizowany!");
      const data = await response.json();
      setProfile(data);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił błąd podczas zapisywania profilu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Wczytywanie profilu...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <CharacterForm
      initialData={profile}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Zapisz"
    />
  );
};

export default ProfileView;
