"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthModalStore } from "@/lib/stores/authModal.store";

export const RegistrationFormSchema = z
  .object({
    email: z.string().email({ message: "Niepoprawny format adresu e-mail." }),
    password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne.",
    path: ["confirmPassword"],
  });

export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;

export function RegistrationForm() {
  const { setView } = useAuthModalStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: RegistrationFormData) {
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        const errorMessage = await response.text();
        setApiError(errorMessage || "Wystąpił nieoczekiwany błąd.");
      }
    } catch (error) {
      setApiError("Wystąpił błąd sieci. Spróbuj ponownie.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jan.kowalski@example.pl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Rejestrowanie..." : "Zarejestruj się"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Button variant="link" className="p-0" onClick={() => setView("login")}>
          Zaloguj się
        </Button>
      </p>
    </Form>
  );
}
