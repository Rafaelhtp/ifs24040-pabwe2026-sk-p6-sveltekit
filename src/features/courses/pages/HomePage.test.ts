import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { coursesStore } from "../states/coursesStore";
import { FALLBACK_IMAGE_SRC } from "../../../helpers/toolsHelper";
import courseApi from "../api/courseApi";
import { mockGoto } from "../../../setupTests";

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockCourses = [
    {
      id: 1,
      user_id: 1,
      title: "Kursus Pertama",
      description: "Deskripsi pertama",
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: { name: "Abdullah Ubaid" },
      students: [1],
      total_contents: 5,
    },
    {
      id: 2,
      user_id: 2,
      title: "Kursus Kedua Orang Lain",
      description: "Deskripsi kedua",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: null,
      students: [],
      total_contents: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // ChangeModal memanggil getCourseById saat dibuka; stub agar tidak memanggil API nyata.
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      title: "Kursus Pertama",
      description: "Deskripsi",
    } as any);
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(() => Promise.resolve());
  });

  it("should return null/empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-course-btn"]').exists()).toBe(false);
  });

  it("should render courses stats, rows, and empty state when empty", async () => {
    vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Daftar Kursus");
    expect(wrapper.text()).toContain("Belum ada data kursus yang cocok.");
  });

  it("should display loading indicator while loading courses", async () => {
    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: [],
      },
    });

    vi.spyOn(cStore, "asyncSetCourses").mockReturnValue(new Promise(() => {}));
    const filterMyCoursesBtn = wrapper.find('[data-testid="filter-my-courses-btn"]');
    (filterMyCoursesBtn.element as HTMLElement).click();

    expect(wrapper.text()).toContain("Memuat daftar kursus...");
  });

  it("should display stats count and filter/search courses", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Total Kursus");
    expect(wrapper.text()).toContain("Kursus Pertama");
    expect(wrapper.text()).toContain("Kursus Kedua Orang Lain");

    // Search filter by title
    const searchInput = wrapper.find('[data-testid="search-course-input"]');
    await searchInput.setValue("Pertama");
    expect(wrapper.text()).toContain("Kursus Pertama");
    expect(wrapper.text()).not.toContain("Kursus Kedua Orang Lain");

    // Search filter by description
    await searchInput.setValue("kedua");
    expect(wrapper.text()).toContain("Kursus Kedua Orang Lain");

    // Filter tabs
    const filterMyCoursesBtn = wrapper.find('[data-testid="filter-my-courses-btn"]');
    (filterMyCoursesBtn.element as HTMLElement).click();

    const filterAllBtn = wrapper.find('[data-testid="filter-all-btn"]');
    (filterAllBtn.element as HTMLElement).click();
  });

  it("should handle search against courses with null title and description", async () => {
    vi.spyOn(toolsHelper, "formatDate").mockReturnValue("-");
    vi.spyOn(coursesStore, "asyncSetCourses").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: [{ id: 99, title: null, description: null }],
      },
    });
    await new Promise((r) => setTimeout(r, 20));

    const searchInput = wrapper.find('[data-testid="search-course-input"]');
    await searchInput.setValue("xyz");
    expect(wrapper.text()).toContain("Belum ada data kursus yang cocok.");
  });

  it("should open and close AddModal when Tambah Kursus button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const addBtn = wrapper.find('[data-testid="add-course-btn"]');
    (addBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(false);
  });

  it("should navigate to detail page when view icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    mockGoto.mockClear();
    await new Promise((r) => setTimeout(r, 20));

    const viewBtn = wrapper.find('[data-testid="view-course-1"]');
    (viewBtn.element as HTMLElement).click();

    expect(mockGoto).toHaveBeenCalledWith("/courses/1");
  });

  it("should open and close edit modal when edit icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const editBtn = wrapper.find('[data-testid="edit-course-1"]');
    (editBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
  });

  it("should trigger confirm dialog and dispatch delete when delete icon confirmed", async () => {
    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(cStore, "asyncSetIsCourseDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const deleteBtn = wrapper.find('[data-testid="delete-course-1"]');
    (deleteBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteActionSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(cStore, "asyncSetIsCourseDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);

    const deleteBtn = wrapper.find('[data-testid="delete-course-1"]');
    (deleteBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteActionSpy).not.toHaveBeenCalled();
  });

  it("should trigger delete all courses when confirmed", async () => {
    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    const deleteAllSpy = vi
      .spyOn(cStore, "asyncSetIsCourseDeleteAll")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-courses-btn"]');
    (deleteAllBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should not delete all courses when cancelled", async () => {
    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
      },
    });

    const deleteAllSpy = vi
      .spyOn(cStore, "asyncSetIsCourseDeleteAll")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-courses-btn"]');
    (deleteAllBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should reload courses when isCourseDeleted is true", async () => {
    const { coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: mockCourses,
        isCourseDeleted: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const asyncSetCoursesSpy = vi
      .spyOn(cStore, "asyncSetCourses")
      .mockReturnValue(Promise.resolve());

    cStore.setIsCourseDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(asyncSetCoursesSpy).toHaveBeenCalled();
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad: any;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, coursesStore: cStore } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, courses: [] },
    });

    vi.spyOn(cStore, "asyncSetCourses").mockReturnValue(pendingPromise as any);

    const filterMyCoursesBtn = wrapper.find('[data-testid="filter-my-courses-btn"]');
    (filterMyCoursesBtn.element as HTMLElement).click();

    wrapper.unmount();
    resolveLoad();
    await pendingPromise;
  });

  it("should handle null courses store gracefully", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        courses: null,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Belum ada data kursus");
  });

  it("should render course cover with explicit size and fallback on error", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, courses: mockCourses },
    });
    await new Promise((r) => setTimeout(r, 20));

    const img = wrapper.find("img");
    expect(img.attributes("width")).toBe("40");
    expect(img.attributes("height")).toBe("40");
    expect(img.attributes("loading")).toBe("lazy");

    img.element.dispatchEvent(new Event("error"));
    expect(img.attributes("src")).toBe(FALLBACK_IMAGE_SRC);
  });
});
