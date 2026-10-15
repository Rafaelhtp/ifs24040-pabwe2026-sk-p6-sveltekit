import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import courseApi from "../api/courseApi";

describe("ChangeModal", () => {
  const mockCourse = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, courseId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with course data and handle changes", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-course-title-input"]');
    const descInput = wrapper.find('[data-testid="edit-course-description-input"]');

    expect((titleInput.element as HTMLInputElement).value).toBe("Initial Title");
    expect((descInput.element as HTMLTextAreaElement).value).toBe("Initial Desc");
  });

  it("should handle error in loadCourseData and call handleClose", async () => {
    vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("Fail"));
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));
    const closeSpy = vi.fn();

    renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data kursus");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle empty title and description in course object", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue({
      id: 1,
      title: null,
      description: null,
    } as any);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect((wrapper.find('[data-testid="edit-course-title-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("should validate empty title and empty description", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-course-title-input"]');
    const form = wrapper.find("form");

    await titleInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul kursus tidak boleh kosong");

    await titleInput.setValue("Valid Title");
    const descInput = wrapper.find('[data-testid="edit-course-description-input"]');
    await descInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi kursus tidak boleh kosong");
  });

  it("should dispatch asyncSetIsCourseChange and close on success", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);
    const closeSpy = vi.fn();

    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1, onClose: closeSpy },
      preloadedState: {
        isCourseChange: false,
        isCourseChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "Initial Desc");

    coursesStore.setIsCourseChange(true);
    coursesStore.setIsCourseChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isCourseChange true when isCourseChanged is false", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);

    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
      preloadedState: {
        isCourseChange: false,
        isCourseChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    coursesStore.setIsCourseChange(true);
    coursesStore.setIsCourseChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-course-title-input"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    (cancelBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should not call asyncSetIsCourseChange when courseId is null", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(null as any);

    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: null },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-course-title-input"]');
    const descInput = wrapper.find('[data-testid="edit-course-description-input"]');
    await titleInput.setValue("Judul");
    await descInput.setValue("Deskripsi");

    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockReturnValue(Promise.resolve());
    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should update visibility on show prop change", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);
    const { wrapper, rerender } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(true);

    await rerender({ show: false, courseId: 1 });
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
  });

  it("should handle close without onClose callback", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValue(mockCourse as any);
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, courseId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(wrapper.exists()).toBe(true);
  });
});
