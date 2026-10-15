import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseLayout from "./CourseLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";
import { mockGoto } from "../../../setupTests";

describe("CourseLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: null,
      },
    });

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should render layout with navbar and sidebar and handle sidebar toggling & logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Test User",
          email: "test@delcom.org",
        },
      },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("Test User");
    expect(wrapper.text()).toContain("Semua Kursus");

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    (toggleBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    (backdrop.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);

    const navLinks = wrapper.findAll("aside a");
    (navLinks[0].element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(() => Promise.resolve());
    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    (dropdownBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    (logoutBtn.element as HTMLElement).click();

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should stay on page when isProfile is triggered and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());

    const { wrapper, usersStore: uStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isProfile: false,
      },
    });

    mockGoto.mockClear();
    uStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Logged User");
    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("should redirect to login when isProfile is triggered and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: null,
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { authStore } = renderWithProviders(CourseLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isAuthLogout: false,
      },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
  });
});
