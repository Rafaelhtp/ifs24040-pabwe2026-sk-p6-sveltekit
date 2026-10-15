import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentModal from "./ContentModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ContentModal", () => {
  const mockContent = {
    id: 10,
    course_id: 1,
    title: "Materi Awal",
    youtube: "https://youtu.be/abc",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: false, courseId: 1 },
    });
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);
  });

  it("should render in add mode when content prop is null", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null },
    });

    expect(wrapper.text()).toContain("Tambah Materi Konten");
    expect(wrapper.text()).toContain("Tambah Materi");
  });

  it("should render in edit mode and populate fields when content prop is provided", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: mockContent },
    });

    expect(wrapper.text()).toContain("Ubah Materi Konten");
    expect(wrapper.text()).toContain("Perbarui Materi");

    const titleInput = wrapper.find('[data-testid="content-title-input"]');
    const ytInput = wrapper.find('[data-testid="content-youtube-input"]');
    expect((titleInput.element as HTMLInputElement).value).toBe("Materi Awal");
    expect((ytInput.element as HTMLInputElement).value).toBe("https://youtu.be/abc");
  });

  it("should validate empty title and empty youtube", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));

    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul materi tidak boleh kosong");

    const titleInput = wrapper.find('[data-testid="content-title-input"]');
    await titleInput.setValue("Judul Valid");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL YouTube tidak boleh kosong");
  });

  it("should call asyncSetIsContentAdd in add mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null, onClose: closeSpy },
      preloadedState: {
        isContentAdd: false,
        isContentAdded: false,
      },
    });

    const addSpy = vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="content-title-input"]');
    const ytInput = wrapper.find('[data-testid="content-youtube-input"]');
    await titleInput.setValue("Materi Baru");
    await ytInput.setValue("https://youtu.be/new");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Materi Baru", "https://youtu.be/new");

    coursesStore.setIsContentAdd(true);
    coursesStore.setIsContentAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should call asyncSetIsContentChange in edit mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: mockContent, onClose: closeSpy },
      preloadedState: {
        isContentChange: false,
        isContentChanged: false,
      },
    });

    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsContentChange").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="content-title-input"]');
    const ytInput = wrapper.find('[data-testid="content-youtube-input"]');
    await titleInput.setValue("Materi Diubah");
    await ytInput.setValue("https://youtu.be/edited");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(10, "Materi Diubah", "https://youtu.be/edited");

    coursesStore.setIsContentChange(true);
    coursesStore.setIsContentChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isContentAdd / isContentChange true when Added / Changed is false", async () => {
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null },
      preloadedState: {
        isContentAdd: false,
        isContentAdded: false,
      },
    });

    coursesStore.setIsContentAdd(true);
    coursesStore.setIsContentAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);
  });

  it("should handle isContentChange true when isContentChanged is false", async () => {
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: mockContent },
      preloadedState: {
        isContentChange: false,
        isContentChanged: false,
      },
    });

    coursesStore.setIsContentChange(true);
    coursesStore.setIsContentChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-content-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-content-modal-btn"]');
    (cancelBtn.element as HTMLElement).click();
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null },
    });

    const closeBtn = wrapper.find('[data-testid="close-content-modal-btn"]');
    (closeBtn.element as HTMLElement).click();
    expect(wrapper.exists()).toBe(true);
  });

  it("should update visibility on show prop change", async () => {
    const { wrapper, rerender } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content: null },
    });
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);

    await rerender({ show: false, courseId: 1, content: null });
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with empty string when content title or youtube is falsy", () => {
    const { wrapper } = renderWithProviders(ContentModal, {
      props: {
        show: true,
        courseId: 1,
        content: { id: 99, title: "", youtube: "" } as any,
      },
    });

    const titleInput = wrapper.find('[data-testid="content-title-input"]');
    expect((titleInput.element as HTMLInputElement).value).toBe("");
  });
});
