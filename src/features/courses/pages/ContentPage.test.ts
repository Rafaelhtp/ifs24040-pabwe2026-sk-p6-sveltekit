import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentPage from "./ContentPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import { mockGoto } from "../../../setupTests";

describe("ContentPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockCourse = { id: 1, title: "Dasar Svelte 5" };
  const mockContentFinished = {
    id: 10,
    course_id: 1,
    title: "Materi Pengenalan",
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    my_status_finished: true,
  };

  const mockContentUnfinished = {
    id: 11,
    course_id: 1,
    title: "Materi Lanjutan",
    youtube: "https://youtu.be/abc12345",
    my_status_finished: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or content is missing", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: null,
        courseContent: null,
      },
    });

    expect(wrapper.text()).toContain("Memuat materi pembelajaran...");
  });

  it("should render finished content with youtube watch embed and allow marking unfinished", async () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const learnSpy = vi.spyOn(coursesStore, "asyncSetIsContentLearn").mockReturnValue(Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentFinished,
      },
    });

    expect(wrapper.text()).toContain("Materi Pengenalan");
    expect(wrapper.text()).toContain("Selesai Dipelajari");
    expect(wrapper.text()).toContain("Tandai Belum Selesai");

    const iframe = wrapper.find("iframe");
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes("src")).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(iframe.attributes("title")).toBe("Video Materi: Materi Pengenalan");

    // Click toggle status
    const toggleBtn = wrapper.find('[data-testid="toggle-learn-status-btn"]');
    (toggleBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(learnSpy).toHaveBeenCalledWith(10, 0);
  });

  it("should render unfinished content with youtu.be embed and allow marking finished", async () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const learnSpy = vi.spyOn(coursesStore, "asyncSetIsContentLearn").mockReturnValue(Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 11 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentUnfinished,
      },
    });

    expect(wrapper.text()).toContain("Materi Lanjutan");
    expect(wrapper.text()).toContain("Belum Selesai");
    expect(wrapper.text()).toContain("Tandai Sudah Selesai");

    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://www.youtube.com/embed/abc12345");

    // Click toggle status
    const toggleBtn = wrapper.find('[data-testid="toggle-learn-status-btn"]');
    (toggleBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(learnSpy).toHaveBeenCalledWith(11, 1);
  });

  it("should handle embed url with existing embed link or invalid link", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 12 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: {
          id: 12,
          course_id: 1,
          title: "Custom Embed",
          youtube: "https://www.youtube.com/embed/custom123",
          my_status_finished: 0,
        },
      },
    });

    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://www.youtube.com/embed/custom123");
  });

  it("should render placeholder when youtube url is empty", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 13 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: {
          id: 13,
          course_id: 1,
          title: "No Video",
          youtube: "",
          my_status_finished: 0,
        },
      },
    });

    expect(wrapper.text()).toContain("Video tidak tersedia");
  });

  it("should redirect to course detail when isCourseContent is true and content is null", async () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { coursesStore: cStore } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 99 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: null,
        isCourseContent: false,
      },
    });

    cStore.setIsCourseContent(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).toHaveBeenCalledWith("/courses/1");
  });

  it("should stay on page when isCourseContent is true and content exists", async () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { coursesStore: cStore } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentFinished,
        isCourseContent: false,
      },
    });

    mockGoto.mockClear();
    cStore.setIsCourseContent(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("should refresh content when isContentLearn with isContentLearned occurs", async () => {
    const refreshSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { coursesStore: cStore } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentFinished,
      },
    });

    refreshSpy.mockClear();
    cStore.setIsContentLearn(true);
    cStore.setIsContentLearned(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(refreshSpy).toHaveBeenCalledWith(10);
  });

  it("should trigger asyncSetCourseContent on contentId prop change", async () => {
    const setContentSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { rerender } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentFinished,
      },
    });

    await rerender({ courseId: 1, contentId: 20 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setContentSpy).toHaveBeenCalledWith(20);
  });

  it("should handle youtube url fallbacks when id is empty or non-youtube url", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper, rerender } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 14 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: {
          id: 14,
          course_id: 1,
          title: "Vimeo",
          youtube: "https://vimeo.com/123",
          my_status_finished: 0,
        },
      },
    });

    let iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://vimeo.com/123");
  });

  it("should handle empty youtube IDs and missing course title", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 15 },
      preloadedState: {
        profile: mockProfile,
        course: { id: 1, title: "" },
        courseContent: {
          id: 15,
          course_id: 1,
          title: "Empty Youtu",
          youtube: "https://youtu.be/",
          my_status_finished: 1,
        },
      },
    });

    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://youtu.be/");
    expect(wrapper.text()).toContain("Kembali ke Kursus");
  });

  it("should handle empty watch id in getEmbedUrl", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 16 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: {
          id: 16,
          course_id: 1,
          title: "Empty Watch",
          youtube: "https://youtube.com/watch?v=",
          my_status_finished: 0,
        },
      },
    });

    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://youtube.com/watch?v=");
  });

  it("should handle isContentLearn true when isContentLearned is false", async () => {
    const refreshSpy = vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { coursesStore: cStore } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 10 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: mockContentFinished,
      },
    });

    refreshSpy.mockClear();
    cStore.setIsContentLearn(true);
    cStore.setIsContentLearned(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it("should handle null content id in template", () => {
    vi.spyOn(coursesStore, "asyncSetCourseContent").mockImplementation(() => Promise.resolve());
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(ContentPage, {
      props: { courseId: 1, contentId: 999 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourse,
        courseContent: {
          id: null as any,
          course_id: 1,
          title: "Null ID Content",
          youtube: "https://youtu.be/abc",
          my_status_finished: 0,
        },
      },
    });

    expect(wrapper.text()).toContain("Materi #");
  });
});
