import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi, { isCourseOwner, isCourseStudent, type Course } from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: Record<string, unknown>) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  } as unknown as Response);
}

describe("courseApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postCourse", () => {
    it("should create course and return data", async () => {
      const spy = mockResponse({ status: "success", data: { course_id: 10 } });
      const res = await courseApi.postCourse("Judul", "Deskripsi");
      expect(res).toEqual({ course_id: 10 });
      const [url, init] = spy.mock.calls[0];
      expect(url).toMatch(/\/courses\/$/);
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ title: "Judul", description: "Deskripsi" }));
    });
  });

  describe("postCourseCover", () => {
    it("should upload cover using FormData", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await courseApi.postCourseCover(1, file);
      expect(msg).toBe("Berhasil mengubah cover");
      const [url, init] = spy.mock.calls[0];
      expect(url).toMatch(/\/courses\/1\/cover$/);
      expect(init?.body).toBeInstanceOf(FormData);
    });

    it("should fall back to default file name for nameless blobs", async () => {
      mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await courseApi.postCourseCover(1, blob as File);
      expect(msg).toBe("ok");
    });
  });

  describe("putCourse", () => {
    it("should update course and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });
      const msg = await courseApi.putCourse(1, "A", "B");
      expect(msg).toBe("Berhasil mengubah data");
      expect(spy.mock.calls[0][1]?.method).toBe("PUT");
    });
  });

  describe("getCourses", () => {
    it("should fetch all courses", async () => {
      const courses = [{ id: 1, title: "A", description: "B" }];
      const spy = mockResponse({ status: "success", data: { courses } });
      expect(await courseApi.getCourses()).toEqual(courses);
      expect(spy.mock.calls[0][0]).toMatch(/\/courses$/);
    });

    it("should fetch own courses with is_me param", async () => {
      const spy = mockResponse({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(true);
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\?is_me=1$/);
    });

    it("should return empty array when data.courses is missing", async () => {
      mockResponse({ status: "success", data: {} });
      expect(await courseApi.getCourses()).toEqual([]);
    });
  });

  describe("getCourseById", () => {
    it("should return course detail", async () => {
      const course = { id: 5, title: "Detail", description: "D" };
      mockResponse({ status: "success", data: { course } });
      expect(await courseApi.getCourseById(5)).toEqual(course);
    });
  });

  describe("deleteCourse", () => {
    it("should delete course and return message", async () => {
      mockResponse({ status: "success", message: "Berhasil menghapus data" });
      expect(await courseApi.deleteCourse(1)).toBe("Berhasil menghapus data");
    });
  });

  describe("deleteCourses", () => {
    it("should delete all courses", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus semua" });
      expect(await courseApi.deleteCourses()).toBe("Berhasil menghapus semua");
      expect(spy.mock.calls[0][1]?.method).toBe("DELETE");
    });
  });

  describe("students", () => {
    it("should join a course", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menjadi pelajar" });
      expect(await courseApi.postCourseStudent(2)).toBe("Berhasil menjadi pelajar");
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\/2\/students$/);
      expect(spy.mock.calls[0][1]?.method).toBe("POST");
    });

    it("should leave a course", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil keluar" });
      expect(await courseApi.deleteCourseStudent(2)).toBe("Berhasil keluar");
      expect(spy.mock.calls[0][1]?.method).toBe("DELETE");
    });
  });

  describe("putCourseRating", () => {
    it("should send ratings and comment", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah ratings" });
      expect(await courseApi.putCourseRating(2, 5, "Mantap")).toBe("Berhasil mengubah ratings");
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\/2\/students\/ratings$/);
      expect(spy.mock.calls[0][1]?.body).toBe(JSON.stringify({ ratings: 5, comment: "Mantap" }));
    });
  });

  describe("contents", () => {
    it("should add content", async () => {
      const spy = mockResponse({ status: "success", data: { content_id: 1 } });
      expect(await courseApi.postCourseContent(3, "Judul", "https://youtu.be/abc")).toEqual({
        content_id: 1,
      });
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\/3\/contents$/);
    });

    it("should update content", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah konten" });
      expect(await courseApi.putCourseContent(4, "J", "https://youtu.be/abc")).toBe(
        "Berhasil mengubah konten"
      );
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\/-\/contents\/4$/);
    });

    it("should get content detail", async () => {
      const content = { id: 4, title: "J", youtube: "https://youtu.be/abc" };
      mockResponse({ status: "success", data: { course_content: content } });
      expect(await courseApi.getCourseContentById(4)).toEqual(content);
    });

    it("should delete content", async () => {
      mockResponse({ status: "success", message: "Berhasil menghapus konten" });
      expect(await courseApi.deleteCourseContent(4)).toBe("Berhasil menghapus konten");
    });

    it("should change learning status", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah status" });
      expect(await courseApi.postCourseContentLearn(4, 1)).toBe("Berhasil mengubah status");
      expect(spy.mock.calls[0][0]).toMatch(/\/courses\/-\/contents\/4\/learns$/);
      expect(spy.mock.calls[0][1]?.body).toBe(JSON.stringify({ status: 1 }));
    });
  });

  describe("error handling", () => {
    it("should throw the API message when status is not success", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.postCourse("", "")).rejects.toThrow("Data tidak valid");
    });

    it("should throw the fallback message when API message is missing", async () => {
      mockResponse({ status: "fail" });
      await expect(courseApi.getCourseById(1)).rejects.toThrow("Gagal mengambil detail kursus");
    });
  });

  describe("role helpers", () => {
    const course = { id: 1, user_id: 7, title: "A", description: "B", students: [3, "9"] } as Course;

    it("should detect owner", () => {
      expect(isCourseOwner(course, 7)).toBe(true);
      expect(isCourseOwner(course, "7")).toBe(true);
      expect(isCourseOwner(course, 8)).toBe(false);
      expect(isCourseOwner(null, 7)).toBe(false);
      expect(isCourseOwner(course, undefined)).toBe(false);
      expect(isCourseOwner(course, null)).toBe(false);
    });

    it("should detect student", () => {
      expect(isCourseStudent(course, 3)).toBe(true);
      expect(isCourseStudent(course, 9)).toBe(true);
      expect(isCourseStudent(course, 4)).toBe(false);
      expect(isCourseStudent({ ...course, students: undefined }, 3)).toBe(false);
      expect(isCourseStudent(null, 3)).toBe(false);
      expect(isCourseStudent(course, undefined)).toBe(false);
      expect(isCourseStudent(course, null)).toBe(false);
    });
  });
});
