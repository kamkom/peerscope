import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import type { ProfileFormData } from "./types";

test.describe("Profile Form", () => {
  test("should login and fill profile form", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);

    // Step 1: Open the application
    await page.goto("/");
    await expect(page).toHaveTitle(/Peerscope - Welcome/);

    // Step 2: Login as e2e@e2e.com with password e2etests
    await loginPage.login("e2e@e2e.com", "e2etests");
    // await expect(page).toHaveURL(/.*\/dashboard/);

    // Step 3: Fill the my profile form
    await profilePage.goto();
    await expect(page).toHaveURL(/.*\/dashboard\/profile/);

    // Wait for profile to load
    await page.waitForSelector('input[placeholder="Np. Jan Kowalski"]', { state: "visible" });

    const profileData: ProfileFormData = {
      name: "E2E Test User",
      role: "Test Role",
      description: "E2E test profile description",
      avatar_url: "https://api.dicebear.com/9.x/adventurer/svg?seed=PiotrN.jpg",
      traits: ["brave", "honest"],
      motivations: ["helping others", "testing"],
    };

    await profilePage.fillProfile(profileData);
    await profilePage.submit();
  });
});
