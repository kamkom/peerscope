import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { ProfileFormData } from "../types";

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/dashboard/profile");
    await this.page.waitForLoadState("networkidle");
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByLabel("Imię").fill(name);
  }

  async fillRole(role: string): Promise<void> {
    await this.page.getByLabel("Rola").fill(role);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.getByLabel("Opis").fill(description);
  }

  async fillAvatarUrl(url: string): Promise<void> {
    await this.page.getByPlaceholder("https://example.com/avatar.jpg").fill(url);
  }

  async addTrait(trait: string): Promise<void> {
    const traitInput = this.page.getByPlaceholder("Dodaj cechę");
    await traitInput.fill(trait);
    await traitInput.press("Enter");
  }

  async addMotivation(motivation: string): Promise<void> {
    const motivationInput = this.page.getByPlaceholder("Dodaj motywację");
    await motivationInput.fill(motivation);
    await motivationInput.press("Enter");
  }

  async submit(): Promise<void> {
    await this.page.getByRole("button", { name: "Zapisz" }).click();
  }

  async waitForSuccess(): Promise<void> {
    await expect(this.page.getByText("Profil zaktualizowany!")).toBeVisible({ timeout: 5000 });
  }

  async fillProfile(data: ProfileFormData): Promise<void> {
    if (data.name) {
      await this.fillName(data.name);
    }
    if (data.role) {
      await this.fillRole(data.role);
    }
    if (data.description) {
      await this.fillDescription(data.description);
    }
    if (data.avatar_url) {
      await this.fillAvatarUrl(data.avatar_url);
    }
    if (data.traits) {
      for (const trait of data.traits) {
        await this.addTrait(trait);
      }
    }
    if (data.motivations) {
      for (const motivation of data.motivations) {
        await this.addMotivation(motivation);
      }
    }
  }
}
