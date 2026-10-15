import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { coursesStore } from "../states/coursesStore";
import { mockGoto } from "../../../setupTests";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockCourseOwner = {
    id: 1,
    user_id: 1,
    title: "Detail Kursus Judul",
    description: "Detail Kursus Deskripsi",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    author: { name: "Abdullah Ubaid" },
    students: [2, 3],
    total_contents: 2,
    avg_ratings: "4.50",
    contents: [
      {
        id: 10,
        course_id: 1,
        title: "Pengenalan Svelte 5",
        youtube: "https://youtu.be/abc",
        my_status_finished: true,
      },
      {
        id: 11,
        course_id: 1,
        title: "Materi Belum Selesai",
        youtube: "https://youtu.be/def",
        my_status_finished: false,
      },
    ],
    ratings: [
      {
        name: "Budi",
        ratings: 5,
        comment: "Keren materinya",
      },
      {
        name: "Siti",
        ratings: 4,
        comment: null,
      },
    ],
  };

  const mockCourseStudent = {
    id: 2,
    user_id: 99,
    title: "Kursus Budi",
    description: "",
    cover: null,
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    author: { name: "Budi" },
    students: [1],
    total_contents: 1,
    avg_ratings: null,
    contents: [
      {
        id: 20,
        course_id: 2,
        title: "Materi Siswa",
        youtube: "https://youtu.be/xyz",
        my_status_finished: true,
      },
    ],
    ratings: [],
  };

  const mockCourseGuest = {
    id: 3,
    user_id: 99,
    title: "Kursus Publik",
    description: "Deskripsi",
    cover: null,
    students: [88],
    contents: [],
    ratings: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or course is missing", () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: null,
        course: null,
      },
    });

    expect(wrapper.text()).not.toContain("Detail Kursus Judul");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: null,
      },
    });
    expect(wrapper2.text()).toContain("Memuat detail kursus...");
  });

  it("should not call asyncSetCourse if courseId is not provided onMount", () => {
    const spy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    renderWithProviders(DetailPage, {
      props: { courseId: null as any },
      preloadedState: {
        profile: mockProfile,
        course: null,
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should render owner UI correctly and handle modals & content management", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
      },
    });

    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.text()).toContain("Detail Kursus Judul");
    expect(wrapper.text()).toContain("Pemilik Kursus");
    expect(wrapper.text()).toContain("Pengenalan Svelte 5");
    expect(wrapper.text()).toContain("Selesai");

    // Open & close cover modal
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    (editCoverBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    (closeCoverBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-course-btn"]');
    (editDetailBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    (closeEditBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);

    // Open & close content modal from header
    const addContentBtn = wrapper.find('[data-testid="add-content-btn"]');
    (addContentBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);

    const closeContentBtn = wrapper.find('[data-testid="close-content-modal-btn"]');
    (closeContentBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);

    // Open & close content modal from inline button
    const inlineAddBtn = wrapper.find('[data-testid="add-content-inline-btn"]');
    (inlineAddBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);

    const cancelContentBtn = wrapper.find('[data-testid="cancel-content-modal-btn"]');
    (cancelContentBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);

    // Edit content item
    const editItemBtn = wrapper.find('[data-testid="edit-content-10"]');
    (editItemBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);
    const closeItemBtn = wrapper.find('[data-testid="close-content-modal-btn"]');
    (closeItemBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    // Navigate to content
    const viewContentBtn = wrapper.find('[data-testid="view-content-10"]');
    (viewContentBtn.element as HTMLElement).click();
    expect(mockGoto).toHaveBeenCalledWith("/courses/1/contents/10");
  });

  it("should handle delete course confirmed and cancelled", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(coursesStore, "asyncSetIsCourseDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-course-btn"]');
    (deleteBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(1);

    // When cancelled
    deleteSpy.mockClear();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    (deleteBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should handle delete content confirmed and cancelled", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(coursesStore, "asyncSetIsContentDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
      },
    });

    const deleteItemBtn = wrapper.find('[data-testid="delete-content-10"]');
    (deleteItemBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(10);

    deleteSpy.mockClear();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    (deleteItemBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should render student UI and handle leave course & submitting rating", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const leaveSpy = vi.spyOn(coursesStore, "asyncSetIsStudentLeave").mockReturnValue(Promise.resolve());
    const ratingSpy = vi.spyOn(coursesStore, "asyncSetIsRatingChange").mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 2 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseStudent,
      },
    });

    expect(wrapper.text()).toContain("Terdaftar sebagai Peserta");
    expect(wrapper.text()).toContain("Beri Ulasan Kursus Ini");

    // Leave course
    const leaveBtn = wrapper.find('[data-testid="leave-course-btn"]');
    (leaveBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(leaveSpy).toHaveBeenCalledWith(2);

    leaveSpy.mockClear();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    (leaveBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(leaveSpy).not.toHaveBeenCalled();

    // Submit rating
    const ratingSelect = wrapper.find('[data-testid="rating-score-select"]');
    const commentInput = wrapper.find('[data-testid="rating-comment-input"]');
    await ratingSelect.setValue("4");
    await commentInput.setValue("Bagus banget!");

    const ratingBtn = wrapper.find('[data-testid="submit-rating-btn"]');
    (ratingBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(ratingSpy).toHaveBeenCalledWith(2, 4, "Bagus banget!");
  });

  it("should validate rating score if out of range", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 2 },
      preloadedState: {
        profile: mockProfile,
        course: { ...mockCourseStudent },
      },
    });

    const ratingSelect = wrapper.find('[data-testid="rating-score-select"]');
    await ratingSelect.setValue("0");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Rating harus berada dalam skala 1 sampai 5");
  });

  it("should render guest UI and allow joining course", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const joinSpy = vi.spyOn(coursesStore, "asyncSetIsStudentJoin").mockReturnValue(Promise.resolve());

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 3 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseGuest,
      },
    });

    const joinBtn = wrapper.find('[data-testid="join-course-btn"]');
    expect(joinBtn.exists()).toBe(true);
    (joinBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    expect(joinSpy).toHaveBeenCalledWith(3);
  });

  it("should navigate back to home if isCourse is true and course is null", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { coursesStore: cStore } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: null,
        isCourse: false,
      },
    });

    cStore.setIsCourse(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).toHaveBeenCalledWith("/");
  });

  it("should stay on page if isCourse is true and course exists", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { coursesStore: cStore } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
        isCourse: false,
      },
    });

    mockGoto.mockClear();
    cStore.setIsCourse(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isCourseDeleted is true", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { coursesStore: cStore } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
        isCourseDeleted: false,
      },
    });

    cStore.setIsCourseDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockGoto).toHaveBeenCalledWith("/");
  });

  it("should refresh course when isStudentChange, isRatingChange, or isContentDelete occur", async () => {
    const refreshSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());

    const { coursesStore: cStore } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
      },
    });

    refreshSpy.mockClear();
    cStore.setIsStudentChange(true);
    cStore.setIsStudentChanged(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).toHaveBeenCalledWith(1);

    refreshSpy.mockClear();
    cStore.setIsStudentChange(true);
    cStore.setIsStudentChanged(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).not.toHaveBeenCalled();

    refreshSpy.mockClear();
    cStore.setIsRatingChange(true);
    cStore.setIsRatingChanged(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).toHaveBeenCalledWith(1);

    refreshSpy.mockClear();
    cStore.setIsRatingChange(true);
    cStore.setIsRatingChanged(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).not.toHaveBeenCalled();

    refreshSpy.mockClear();
    cStore.setIsContentDelete(true);
    cStore.setIsContentDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).toHaveBeenCalledWith(1);

    refreshSpy.mockClear();
    cStore.setIsContentDelete(true);
    cStore.setIsContentDeleted(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it("should render guest UI correctly when students list is undefined", () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 3 },
      preloadedState: {
        profile: mockProfile,
        course: { ...mockCourseGuest, students: undefined },
      },
    });

    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(true);
  });

  it("should trigger asyncSetCourse on courseId prop change", async () => {
    const setCourseSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { rerender } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: mockCourseOwner,
      },
    });

    await rerender({ courseId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setCourseSpy).toHaveBeenCalledWith(2);
  });

  it("should render add-first-content-btn when owner has no contents", async () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 1 },
      preloadedState: {
        profile: mockProfile,
        course: { ...mockCourseOwner, contents: [] },
      },
    });

    const addFirstBtn = wrapper.find('[data-testid="add-first-content-btn"]');
    expect(addFirstBtn.exists()).toBe(true);
    (addFirstBtn.element as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(true);
  });

  it("should handle null course id in template", () => {
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: 999 },
      preloadedState: {
        profile: mockProfile,
        course: {
          ...mockCourseOwner,
          id: null as any,
        },
      },
    });

    expect(wrapper.text()).toContain("#");
  });
});
