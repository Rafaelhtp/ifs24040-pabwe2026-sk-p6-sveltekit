import apiHelper from "../../../helpers/apiHelper";

declare const DELCOM_BASEURL: string;

export type EntityId = number | string;

export interface CourseContent {
  id: EntityId;
  course_id?: EntityId;
  title: string;
  youtube: string;
  created_at?: string;
  updated_at?: string;
  my_status_finished?: boolean | number;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment?: string | null;
}

export interface CourseAuthor {
  name: string;
  photo?: string | null;
}

export interface Course {
  id: EntityId;
  user_id?: EntityId;
  title: string;
  description: string;
  cover?: string | null;
  author?: CourseAuthor;
  students?: EntityId[];
  contents?: CourseContent[];
  ratings?: CourseRating[];
  total_contents?: number;
  avg_ratings?: string | null;
  my_percentage_finished?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function isCourseOwner(
  course: Course | null,
  profileId: EntityId | null | undefined
): boolean {
  if (!course || profileId === undefined || profileId === null) return false;
  return String(course.user_id) === String(profileId);
}

export function isCourseStudent(
  course: Course | null,
  profileId: EntityId | null | undefined
): boolean {
  if (!course || profileId === undefined || profileId === null) return false;
  return (course.students || []).some((student) => String(student) === String(profileId));
}

const courseApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/courses`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  function jsonInit(method: string, body?: Record<string, unknown>): RequestInit {
    if (!body) return { method };
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  }

  async function request(path: string, init: RequestInit, fallbackMessage: string): Promise<any> {
    const response = await apiHelper.fetchData(_url(path), init);
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  async function postCourse(title: string, description: string): Promise<any> {
    const result = await request(
      "/",
      jsonInit("POST", { title, description }),
      "Gagal menambahkan kursus"
    );
    return result.data;
  }

  async function postCourseCover(courseId: EntityId, cover: File): Promise<string> {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const result = await request(
      `/${courseId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah cover kursus"
    );
    return result.message;
  }

  async function putCourse(
    courseId: EntityId,
    title: string,
    description: string
  ): Promise<string> {
    const result = await request(
      `/${courseId}`,
      jsonInit("PUT", { title, description }),
      "Gagal mengubah kursus"
    );
    return result.message;
  }

  async function getCourses(isMe: boolean = false): Promise<Course[]> {
    const result = await request(
      isMe ? "?is_me=1" : "",
      jsonInit("GET"),
      "Gagal mengambil data kursus"
    );
    return result.data?.courses || [];
  }

  async function getCourseById(courseId: EntityId): Promise<Course> {
    const result = await request(
      `/${courseId}`,
      jsonInit("GET"),
      "Gagal mengambil detail kursus"
    );
    return result.data?.course;
  }

  async function deleteCourse(courseId: EntityId): Promise<string> {
    const result = await request(
      `/${courseId}`,
      jsonInit("DELETE"),
      "Gagal menghapus kursus"
    );
    return result.message;
  }

  async function deleteCourses(): Promise<string> {
    const result = await request("/", jsonInit("DELETE"), "Gagal menghapus semua kursus");
    return result.message;
  }

  async function postCourseStudent(courseId: EntityId): Promise<string> {
    const result = await request(
      `/${courseId}/students`,
      jsonInit("POST"),
      "Gagal mendaftar pada kursus"
    );
    return result.message;
  }

  async function deleteCourseStudent(courseId: EntityId): Promise<string> {
    const result = await request(
      `/${courseId}/students`,
      jsonInit("DELETE"),
      "Gagal keluar dari kursus"
    );
    return result.message;
  }

  async function putCourseRating(
    courseId: EntityId,
    ratings: number,
    comment: string
  ): Promise<string> {
    const result = await request(
      `/${courseId}/students/ratings`,
      jsonInit("PUT", { ratings, comment }),
      "Gagal mengubah rating kursus"
    );
    return result.message;
  }

  async function postCourseContent(
    courseId: EntityId,
    title: string,
    youtube: string
  ): Promise<any> {
    const result = await request(
      `/${courseId}/contents`,
      jsonInit("POST", { title, youtube }),
      "Gagal menambahkan konten kursus"
    );
    return result.data;
  }

  async function putCourseContent(
    contentId: EntityId,
    title: string,
    youtube: string
  ): Promise<string> {
    const result = await request(
      `/-/contents/${contentId}`,
      jsonInit("PUT", { title, youtube }),
      "Gagal mengubah konten kursus"
    );
    return result.message;
  }

  async function getCourseContentById(contentId: EntityId): Promise<CourseContent> {
    const result = await request(
      `/-/contents/${contentId}`,
      jsonInit("GET"),
      "Gagal mengambil detail konten kursus"
    );
    return result.data?.course_content;
  }

  async function deleteCourseContent(contentId: EntityId): Promise<string> {
    const result = await request(
      `/-/contents/${contentId}`,
      jsonInit("DELETE"),
      "Gagal menghapus konten kursus"
    );
    return result.message;
  }

  async function postCourseContentLearn(
    contentId: EntityId,
    status: 0 | 1
  ): Promise<string> {
    const result = await request(
      `/-/contents/${contentId}/learns`,
      jsonInit("POST", { status }),
      "Gagal mengubah status belajar"
    );
    return result.message;
  }

  return {
    postCourse,
    postCourseCover,
    putCourse,
    getCourses,
    getCourseById,
    deleteCourse,
    deleteCourses,
    postCourseStudent,
    deleteCourseStudent,
    putCourseRating,
    postCourseContent,
    putCourseContent,
    getCourseContentById,
    deleteCourseContent,
    postCourseContentLearn,
  };
})();

export default courseApi;
