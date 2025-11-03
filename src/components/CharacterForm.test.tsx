import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import CharacterForm from "./CharacterForm";
import type { CharacterDto } from "@/types";

expect.extend(toHaveNoViolations);

const mockOnSubmit = vi.fn(() => Promise.resolve());
const mockOnCancel = vi.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  isSubmitting: false,
};

const mockCharacter: CharacterDto = {
  id: "1",
  name: "Testowa Postać",
  role: "Tester",
  description: "Postać do testowania",
  traits: ["diligent", "thorough"],
  motivations: ["quality", "bugs"],
  avatar_url: "http://example.com/avatar.png",
  is_owner: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_interacted_at: null,
  user_id: "user-123",
  deleted_at: null,
};

describe("CharacterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderuje się poprawnie w trybie tworzenia", () => {
    render(<CharacterForm {...defaultProps} />);
    expect(screen.getByLabelText(/imię/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /utwórz/i })).toBeInTheDocument();
  });

  it("renderuje się poprawnie w trybie edycji z danymi początkowymi", () => {
    render(<CharacterForm {...defaultProps} initialData={mockCharacter} />);
    expect(screen.getByLabelText(/imię/i)).toHaveValue(mockCharacter.name);
    expect(screen.getByRole("button", { name: /zapisz zmiany/i })).toBeInTheDocument();
  });

  it("wyświetla przycisk anuluj, gdy podano funkcję onCancel", () => {
    render(<CharacterForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
  });

  it("nie wyświetla przycisku anuluj, gdy nie podano funkcji onCancel", () => {
    render(<CharacterForm {...defaultProps} onCancel={undefined} />);
    expect(screen.queryByRole("button", { name: /anuluj/i })).not.toBeInTheDocument();
  });

  it("przesyła formularz z poprawnymi danymi w trybie tworzenia", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/imię/i), "Nowa Postać");
    await user.click(screen.getByRole("button", { name: /utwórz/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          name: "Nowa Postać",
          avatar_url: undefined,
          description: "",
          is_owner: false,
          motivations: [],
          role: "",
          traits: [],
        },
        expect.any(Object)
      );
    });
  });

  it("przesyła formularz ze zaktualizowanymi danymi w trybie edycji", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...defaultProps} initialData={mockCharacter} />);

    const nameInput = screen.getByLabelText(/imię/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Zmieniona Postać");
    await user.click(screen.getByRole("button", { name: /zapisz zmiany/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          name: "Zmieniona Postać",
          role: mockCharacter.role,
          description: mockCharacter.description,
          traits: mockCharacter.traits,
          motivations: mockCharacter.motivations,
          avatar_url: mockCharacter.avatar_url,
          is_owner: mockCharacter.is_owner,
        },
        expect.any(Object)
      );
    });
  });

  it("wywołuje onCancel, gdy kliknięto przycisk anuluj", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /anuluj/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("wyświetla błąd walidacji dla wymaganego pola imię", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /utwórz/i }));

    expect(await screen.findByText(/imię jest wymagane/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("wyświetla błąd walidacji dla nieprawidłowego URL avatara", async () => {
    const user = userEvent.setup();
    render(<CharacterForm {...defaultProps} />);

    const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com\/avatar\.jpg/i);
    await user.type(urlInput, "not-a-valid-url");
    await user.click(screen.getByRole("button", { name: /utwórz/i }));

    // Poczekaj na walidację Zod (komunikat błędu może być w FormMessage)
    await waitFor(() => {
      const zodError = screen.queryByText(/nieprawidłowy format url/i);
      const avatarError = screen.queryByText(/Invalid image URL or image failed to load/i);
      expect(zodError || avatarError).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("blokuje przycisk przesyłania i wyświetla tekst zapisywanie, gdy isSubmitting jest true", () => {
    render(<CharacterForm {...defaultProps} isSubmitting={true} />);
    const submitButton = screen.getByRole("button", { name: /zapisywanie.../i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("zgodny ze snapshotem w trybie tworzenia", () => {
    const { container } = render(<CharacterForm {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it("zgodny ze snapshotem w trybie edycji", () => {
    const { container } = render(<CharacterForm {...defaultProps} initialData={mockCharacter} />);
    expect(container).toMatchSnapshot();
  });

  it("nie ma naruszeń dostępności", async () => {
    const { container } = render(<CharacterForm {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
