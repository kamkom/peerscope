import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CharacterDto, CreateCharacterCommand } from "@/types";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarUrlInput from "@/components/AvatarUrlInput";
import TagInput from "@/components/TagInput";

const characterFormSchema = z.object({
  name: z.string().min(1, { message: "Imię jest wymagane" }),
  role: z.string().optional(),
  description: z.string().optional(),
  traits: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
  avatar_url: z.string().url({ message: "Nieprawidłowy format URL" }).optional(),
  is_owner: z.boolean(),
});

type CharacterFormViewModel = z.infer<typeof characterFormSchema>;

interface CharacterFormProps {
  initialData?: CharacterDto | null;
  onSubmit: (values: CharacterFormViewModel) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitButtonText?: string;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
}) => {
  const isEditMode = !!initialData?.id;
  const form = useForm<CharacterFormViewModel>({
    resolver: zodResolver(characterFormSchema) as any, // Workaround for resolver type issue
    defaultValues: {
      name: initialData?.name ?? "",
      role: initialData?.role ?? "",
      description: initialData?.description ?? "",
      traits: initialData?.traits ?? [],
      motivations: initialData?.motivations ?? [],
      avatar_url: initialData?.avatar_url || undefined,
      is_owner: initialData?.is_owner ?? false,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL avatara</FormLabel>
                <FormControl>
                  <AvatarUrlInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię</FormLabel>
                <FormControl>
                  <Input placeholder="Np. Jan Kowalski" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rola</FormLabel>
                <FormControl>
                  <Input placeholder="Np. Wojownik, Mag, Detektyw" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="traits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cechy</FormLabel>
                <FormControl>
                  <TagInput placeholder="Dodaj cechę" {...field} value={field.value ?? []} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motivations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motywacje</FormLabel>
                <FormControl>
                  <TagInput placeholder="Dodaj motywację" {...field} value={field.value ?? []} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opis</FormLabel>
                <FormControl>
                  <Textarea placeholder="Opisz postać..." className="resize-y" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Anuluj
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : (submitButtonText ?? (isEditMode ? "Zapisz zmiany" : "Utwórz"))}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default CharacterForm;
