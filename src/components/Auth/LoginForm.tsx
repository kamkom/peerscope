"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthModalStore } from "@/lib/stores/authModal.store";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Niepoprawny format adresu e-mail." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const { setView } = useAuthModalStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormData) {
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const response = await fetch("/api/auth/signin", {
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

        {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Nie masz konta?{" "}
        <Button variant="link" className="p-0" onClick={() => setView("register")}>
          Zarejestruj się
        </Button>
      </p>
    </Form>
  );
}
