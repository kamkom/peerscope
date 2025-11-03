import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async openLoginModal(): Promise<void> {
    await this.page.click("#login-button");
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  private getDialog() {
    return this.page.getByRole("dialog");
  }

  async fillEmail(email: string): Promise<void> {
    await this.getDialog().getByLabel("Email").fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.getDialog().getByLabel("Hasło").fill(password);
  }

  async submit(): Promise<void> {
    await this.getDialog().getByRole("button", { name: "Zaloguj się" }).click();
  }

  async waitForRedirect(): Promise<void> {
    await this.page.waitForURL(/\/dashboard/, { waitUntil: "load" });
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLoginModal();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    await this.waitForRedirect();
  }
}
