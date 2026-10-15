import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: false },
    });
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(false);
  });

  it("should show validation error if title is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul kursus tidak boleh kosong");
  });

  it("should show validation error if description is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));

    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-course-title-input"]');
    await titleInput.setValue("Judul Kursus Baru");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi kursus tidak boleh kosong");
  });

  it("should dispatch asyncSetIsCourseAdd and call onClose on successful add", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(AddModal, {
      props: {
        show: true,
        onClose: closeSpy,
      },
      preloadedState: {
        isCourseAdd: false,
        isCourseAdded: false,
      },
    });

    const asyncAddSpy = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="add-course-title-input"]');
    const descInput = wrapper.find('[data-testid="add-course-description-input"]');

    await titleInput.setValue("Belajar Svelte 5");
    await descInput.setValue("Deskripsi kursus lengkap.");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(asyncAddSpy).toHaveBeenCalledWith("Belajar Svelte 5", "Deskripsi kursus lengkap.");

    coursesStore.setIsCourseAdd(true);
    coursesStore.setIsCourseAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isCourseAdd true when isCourseAdded is false", async () => {
    const { wrapper, coursesStore } = renderWithProviders(AddModal, {
      props: { show: true },
      preloadedState: {
        isCourseAdd: false,
        isCourseAdded: false,
      },
    });

    coursesStore.setIsCourseAdd(true);
    coursesStore.setIsCourseAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(true);
  });

  it("should close modal when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: {
        show: true,
        onClose: closeSpy,
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-add-modal-btn"]');
    (cancelBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close button when onClose prop is omitted", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: {
        show: true,
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(wrapper.exists()).toBe(true);
  });

  it("should update visibility on show prop change", async () => {
    const { wrapper, rerender } = renderWithProviders(AddModal, {
      props: { show: true },
    });
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(true);

    await rerender({ show: false });
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(false);
  });
});
