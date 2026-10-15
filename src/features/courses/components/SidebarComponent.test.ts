import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation links properly", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Semua Kursus");
    expect(wrapper.text()).toContain("Pengguna");
    expect(wrapper.text()).toContain("Profil");
  });

  it("should mark home active on root and on course detail routes", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { route: "/" });
    expect(wrapper.find('a[aria-current="page"]').text()).toContain("Semua Kursus");

    const { wrapper: courseWrapper } = renderWithProviders(SidebarComponent, {
      route: "/courses/1",
    });
    expect(courseWrapper.find('a[aria-current="page"]').text()).toContain("Semua Kursus");
  });

  it("should mark users active on /users and leave home inactive", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { route: "/users" });
    const active = wrapper.findAll('a[aria-current="page"]');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain("Pengguna");
  });

  it("should render backdrop and trigger close-mobile when backdrop clicked on mobile", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    (backdrop.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close on backdrop keydown Escape and ignore other keys", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("keydown", { key: "Enter" });
    expect(closeSpy).not.toHaveBeenCalled();

    await backdrop.trigger("keydown", { key: "Escape" });
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle backdrop click and keydown when onCloseMobile is undefined", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    (backdrop.element as HTMLElement).click();
    await backdrop.trigger("keydown", { key: "Escape" });
    expect(wrapper.exists()).toBe(true);
  });

  it("should trigger close-mobile and navigate when clicking navigation link", async () => {
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const links = wrapper.findAll("a");
    const usersLink = links.find((l: any) => l.text().includes("Pengguna"));
    expect(usersLink).toBeDefined();
    (usersLink.element as HTMLElement).click();

    expect(closeSpy).toHaveBeenCalled();
    expect(mockGoto).toHaveBeenCalledWith("/users");
  });

  it("should navigate when clicking navigation link without onCloseMobile prop", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const links = wrapper.findAll("a");
    const usersLink = links.find((l: any) => l.text().includes("Pengguna"));
    expect(usersLink).toBeDefined();
    (usersLink.element as HTMLElement).click();

    expect(mockGoto).toHaveBeenCalledWith("/users");
  });
});
