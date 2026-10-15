import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { useCoursesStore, coursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

type Mutation = {
  name: string;
  run: () => Promise<void>;
  api: keyof typeof courseApi;
  done: string;
  success: string;
  message: string;
};

describe("coursesStore", () => {
  beforeEach(() => {
    coursesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useCoursesStore();
    expect(store.courses).toEqual([]);
    expect(store.course).toBeNull();
    expect(store.courseContent).toBeNull();
    expect(store.isCourse).toBe(false);
    expect(store.isCourseContent).toBe(false);
    expect(store.isCourseAdd).toBe(false);
    expect(store.isCourseDeleted).toBe(false);
    expect(store.$state.isContentLearned).toBe(false);
  });

  it("should expose state through subscribe and reset with overrides", () => {
    coursesStore.reset({ isCourse: true });
    expect(get(coursesStore).isCourse).toBe(true);
    coursesStore.reset();
    expect(get(coursesStore).isCourse).toBe(false);
  });

  it("should update state with generated setters", () => {
    const store = useCoursesStore();
    store.setCourses([{ id: 1 } as any]);
    expect(store.courses).toEqual([{ id: 1 }]);
    store.setCourse({ id: 2 } as any);
    expect(store.course).toEqual({ id: 2 });
    store.setCourseContent({ id: 3 } as any);
    expect(store.courseContent).toEqual({ id: 3 });
    store.setIsCourse(true);
    expect(store.isCourse).toBe(true);
    store.setIsCourseContent(true);
    expect(store.isCourseContent).toBe(true);
    store.setIsCourseAdd(true);
    expect(store.isCourseAdd).toBe(true);
    store.setIsRatingChanged(true);
    expect(store.isRatingChanged).toBe(true);
    store.setIsContentLearned(true);
    expect(store.isContentLearned).toBe(true);
  });

  describe("asyncSetCourses", () => {
    it("should set courses on success", async () => {
      const spy = vi.spyOn(courseApi, "getCourses").mockResolvedValue([{ id: 1 } as any]);
      await coursesStore.asyncSetCourses(true);
      expect(spy).toHaveBeenCalledWith(true);
      expect(coursesStore.courses).toEqual([{ id: 1 }]);
    });

    it("should default to all courses and set empty array on error", async () => {
      const spy = vi.spyOn(courseApi, "getCourses").mockRejectedValue(new Error("Err"));
      await coursesStore.asyncSetCourses();
      expect(spy).toHaveBeenCalledWith(false);
      expect(coursesStore.courses).toEqual([]);
    });
  });

  describe("asyncSetCourse", () => {
    it("should set course and flag on success", async () => {
      vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toEqual({ id: 1 });
      expect(coursesStore.isCourse).toBe(true);
    });

    it("should set null and flag on error", async () => {
      vi.spyOn(courseApi, "getCourseById").mockRejectedValue(new Error("Err"));
      await coursesStore.asyncSetCourse(99);
      expect(coursesStore.course).toBeNull();
      expect(coursesStore.isCourse).toBe(true);
    });
  });

  describe("asyncSetCourseContent", () => {
    it("should set content and flag on success", async () => {
      vi.spyOn(courseApi, "getCourseContentById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncSetCourseContent(1);
      expect(coursesStore.courseContent).toEqual({ id: 1 });
      expect(coursesStore.isCourseContent).toBe(true);
    });

    it("should set null and flag on error", async () => {
      vi.spyOn(courseApi, "getCourseContentById").mockRejectedValue(new Error("Err"));
      await coursesStore.asyncSetCourseContent(99);
      expect(coursesStore.courseContent).toBeNull();
      expect(coursesStore.isCourseContent).toBe(true);
    });
  });

  const file = new File([""], "cover.jpg");
  const mutations: Mutation[] = [
    {
      name: "asyncSetIsCourseAdd",
      run: () => coursesStore.asyncSetIsCourseAdd("T", "D"),
      api: "postCourse",
      done: "isCourseAdd",
      success: "isCourseAdded",
      message: "Kursus berhasil ditambahkan!",
    },
    {
      name: "asyncSetIsCourseChange",
      run: () => coursesStore.asyncSetIsCourseChange(1, "T", "D"),
      api: "putCourse",
      done: "isCourseChange",
      success: "isCourseChanged",
      message: "Kursus berhasil diubah!",
    },
    {
      name: "asyncSetIsCourseChangeCover",
      run: () => coursesStore.asyncSetIsCourseChangeCover(1, file),
      api: "postCourseCover",
      done: "isCourseChangeCover",
      success: "isCourseChangedCover",
      message: "Cover kursus berhasil diubah!",
    },
    {
      name: "asyncSetIsCourseDelete",
      run: () => coursesStore.asyncSetIsCourseDelete(1),
      api: "deleteCourse",
      done: "isCourseDelete",
      success: "isCourseDeleted",
      message: "Kursus berhasil dihapus!",
    },
    {
      name: "asyncSetIsCourseDeleteAll",
      run: () => coursesStore.asyncSetIsCourseDeleteAll(),
      api: "deleteCourses",
      done: "isCourseDelete",
      success: "isCourseDeleted",
      message: "Semua kursus berhasil dihapus!",
    },
    {
      name: "asyncSetIsStudentJoin",
      run: () => coursesStore.asyncSetIsStudentJoin(1),
      api: "postCourseStudent",
      done: "isStudentChange",
      success: "isStudentChanged",
      message: "Berhasil mendaftar pada kursus!",
    },
    {
      name: "asyncSetIsStudentLeave",
      run: () => coursesStore.asyncSetIsStudentLeave(1),
      api: "deleteCourseStudent",
      done: "isStudentChange",
      success: "isStudentChanged",
      message: "Berhasil keluar dari kursus!",
    },
    {
      name: "asyncSetIsRatingChange",
      run: () => coursesStore.asyncSetIsRatingChange(1, 5, "Bagus"),
      api: "putCourseRating",
      done: "isRatingChange",
      success: "isRatingChanged",
      message: "Rating kursus berhasil disimpan!",
    },
    {
      name: "asyncSetIsContentAdd",
      run: () => coursesStore.asyncSetIsContentAdd(1, "T", "https://youtu.be/a"),
      api: "postCourseContent",
      done: "isContentAdd",
      success: "isContentAdded",
      message: "Konten berhasil ditambahkan!",
    },
    {
      name: "asyncSetIsContentChange",
      run: () => coursesStore.asyncSetIsContentChange(1, "T", "https://youtu.be/a"),
      api: "putCourseContent",
      done: "isContentChange",
      success: "isContentChanged",
      message: "Konten berhasil diubah!",
    },
    {
      name: "asyncSetIsContentDelete",
      run: () => coursesStore.asyncSetIsContentDelete(1),
      api: "deleteCourseContent",
      done: "isContentDelete",
      success: "isContentDeleted",
      message: "Konten berhasil dihapus!",
    },
    {
      name: "asyncSetIsContentLearn",
      run: () => coursesStore.asyncSetIsContentLearn(1, 1),
      api: "postCourseContentLearn",
      done: "isContentLearn",
      success: "isContentLearned",
      message: "Status belajar berhasil diubah!",
    },
  ];

  describe.each(mutations)("$name", ({ run, api, done, success, message }) => {
    it("should show the API message and set flags on success", async () => {
      vi.spyOn(courseApi, api as any).mockResolvedValue("Pesan API" as any);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await run();

      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(coursesStore.$state[success as "isCourseAdded"]).toBe(true);
      expect(coursesStore.$state[done as "isCourseAdd"]).toBe(true);
    });

    it("should use the fallback message when the API message is empty", async () => {
      vi.spyOn(courseApi, api as any).mockResolvedValue("" as any);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await run();

      expect(successSpy).toHaveBeenCalledWith(message);
    });

    it("should show an error dialog and set flags on failure", async () => {
      vi.spyOn(courseApi, api as any).mockRejectedValue(new Error("Gagal"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await run();

      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.$state[success as "isCourseAdded"]).toBe(false);
      expect(coursesStore.$state[done as "isCourseAdd"]).toBe(true);
    });
  });
});
