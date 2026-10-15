import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";

describe("NavbarComponent", () => {
  const mockProfileWithPhoto = {
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
  } as any;

  const mockProfileWithoutPhoto = {
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
  } as any;

  const mockProfileEmpty = {
    name: "",
    email: "",
    photo: null,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render brand and profile photo correctly", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("abdullah@delcom.org");
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
  });

  it("should render avatar initial fallback when photo is null", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithoutPhoto,
        isSidebarOpen: true,
      },
    });

    expect(wrapper.text()).toContain("U");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("should render default Pengguna fallback when profile is empty or missing", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileEmpty,
        isSidebarOpen: false,
      },
    });
    expect(wrapper.text()).toContain("Pengguna");

    const { wrapper: wrapperNull } = renderWithProviders(NavbarComponent);
    expect(wrapperNull.text()).toContain("Pengguna");
  });

  it("should keep the logo link pointing to home", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.find("a").attributes("href")).toBe("/");
  });

  it("should toggle sidebar on mobile menu button click", async () => {
    const toggleSpy = vi.fn();
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
        onToggleSidebar: toggleSpy,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    (toggleBtn.element as HTMLElement).click();
    expect(toggleSpy).toHaveBeenCalled();
  });

  it("should open and close profile dropdown menu, navigate to profile and trigger logout", async () => {
    const logoutSpy = vi.fn();

    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
        onLogout: logoutSpy,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    const profileLink = wrapper.find('[data-testid="dropdown-profile-link"]');
    await profileLink.trigger("click");
    expect(mockGoto).toHaveBeenCalledWith("/profile");

    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");
    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should close dropdown when clicking outside", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    const menu = wrapper.find('[data-testid="profile-dropdown-menu"]');
    menu.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it("should handle toggle sidebar and logout when callback props are omitted", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: true,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    (toggleBtn.element as HTMLElement).click();

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    (dropdownBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 0));
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    (logoutBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);
  });
});
