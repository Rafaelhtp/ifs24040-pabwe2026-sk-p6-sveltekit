import { writable } from "svelte/store";
import courseApi, { type Course, type CourseContent, type EntityId } from "../api/courseApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface CoursesState {
  courses: Course[];
  course: Course | null;
  courseContent: CourseContent | null;
  isCourse: boolean;
  isCourseContent: boolean;
  isCourseAdd: boolean;
  isCourseAdded: boolean;
  isCourseChange: boolean;
  isCourseChanged: boolean;
  isCourseChangeCover: boolean;
  isCourseChangedCover: boolean;
  isCourseDelete: boolean;
  isCourseDeleted: boolean;
  isStudentChange: boolean;
  isStudentChanged: boolean;
  isRatingChange: boolean;
  isRatingChanged: boolean;
  isContentAdd: boolean;
  isContentAdded: boolean;
  isContentChange: boolean;
  isContentChanged: boolean;
  isContentDelete: boolean;
  isContentDeleted: boolean;
  isContentLearn: boolean;
  isContentLearned: boolean;
}

type FlagKey = {
  [K in keyof CoursesState]: CoursesState[K] extends boolean ? K : never;
}[keyof CoursesState];

type CoursesSetters = {
  [K in keyof CoursesState as `set${Capitalize<K>}`]: (value: CoursesState[K]) => void;
};

const initialState: CoursesState = {
  courses: [],
  course: null,
  courseContent: null,
  isCourse: false,
  isCourseContent: false,
  isCourseAdd: false,
  isCourseAdded: false,
  isCourseChange: false,
  isCourseChanged: false,
  isCourseChangeCover: false,
  isCourseChangedCover: false,
  isCourseDelete: false,
  isCourseDeleted: false,
  isStudentChange: false,
  isStudentChanged: false,
  isRatingChange: false,
  isRatingChanged: false,
  isContentAdd: false,
  isContentAdded: false,
  isContentChange: false,
  isContentChanged: false,
  isContentDelete: false,
  isContentDeleted: false,
  isContentLearn: false,
  isContentLearned: false,
};

function createCoursesStore() {
  let currentState: CoursesState = { ...initialState };
  const innerStore = writable<CoursesState>(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  function setFlag(key: FlagKey, value: boolean) {
    innerStore.update((s) => ({ ...s, [key]: value }));
  }

  async function mutate(
    doneKey: FlagKey,
    successKey: FlagKey,
    action: () => Promise<string>,
    fallbackMessage: string
  ) {
    try {
      const message = await action();
      showSuccessDialog(message || fallbackMessage);
      setFlag(successKey, true);
    } catch (error: any) {
      showErrorDialog(error.message);
      setFlag(successKey, false);
    } finally {
      setFlag(doneKey, true);
    }
  }

  const store = {
    subscribe: innerStore.subscribe,
    get $state() {
      return currentState;
    },
    reset(state: Partial<CoursesState> = initialState) {
      innerStore.set({ ...initialState, ...state });
    },
    async asyncSetCourses(isMe: boolean = false) {
      try {
        const courses = await courseApi.getCourses(isMe);
        innerStore.update((s) => ({ ...s, courses }));
      } catch {
        innerStore.update((s) => ({ ...s, courses: [] }));
      }
    },
    async asyncSetCourse(courseId: EntityId) {
      try {
        const course = await courseApi.getCourseById(courseId);
        innerStore.update((s) => ({ ...s, course }));
      } catch {
        innerStore.update((s) => ({ ...s, course: null }));
      } finally {
        setFlag("isCourse", true);
      }
    },
    async asyncSetCourseContent(contentId: EntityId) {
      try {
        const courseContent = await courseApi.getCourseContentById(contentId);
        innerStore.update((s) => ({ ...s, courseContent }));
      } catch {
        innerStore.update((s) => ({ ...s, courseContent: null }));
      } finally {
        setFlag("isCourseContent", true);
      }
    },
    async asyncSetIsCourseAdd(title: string, description: string) {
      await mutate(
        "isCourseAdd",
        "isCourseAdded",
        async () => {
          await courseApi.postCourse(title, description);
          return "";
        },
        "Kursus berhasil ditambahkan!"
      );
    },
    async asyncSetIsCourseChange(courseId: EntityId, title: string, description: string) {
      await mutate(
        "isCourseChange",
        "isCourseChanged",
        () => courseApi.putCourse(courseId, title, description),
        "Kursus berhasil diubah!"
      );
    },
    async asyncSetIsCourseChangeCover(courseId: EntityId, cover: File) {
      await mutate(
        "isCourseChangeCover",
        "isCourseChangedCover",
        () => courseApi.postCourseCover(courseId, cover),
        "Cover kursus berhasil diubah!"
      );
    },
    async asyncSetIsCourseDelete(courseId: EntityId) {
      await mutate(
        "isCourseDelete",
        "isCourseDeleted",
        () => courseApi.deleteCourse(courseId),
        "Kursus berhasil dihapus!"
      );
    },
    async asyncSetIsCourseDeleteAll() {
      await mutate(
        "isCourseDelete",
        "isCourseDeleted",
        () => courseApi.deleteCourses(),
        "Semua kursus berhasil dihapus!"
      );
    },
    async asyncSetIsStudentJoin(courseId: EntityId) {
      await mutate(
        "isStudentChange",
        "isStudentChanged",
        () => courseApi.postCourseStudent(courseId),
        "Berhasil mendaftar pada kursus!"
      );
    },
    async asyncSetIsStudentLeave(courseId: EntityId) {
      await mutate(
        "isStudentChange",
        "isStudentChanged",
        () => courseApi.deleteCourseStudent(courseId),
        "Berhasil keluar dari kursus!"
      );
    },
    async asyncSetIsRatingChange(courseId: EntityId, ratings: number, comment: string) {
      await mutate(
        "isRatingChange",
        "isRatingChanged",
        () => courseApi.putCourseRating(courseId, ratings, comment),
        "Rating kursus berhasil disimpan!"
      );
    },
    async asyncSetIsContentAdd(courseId: EntityId, title: string, youtube: string) {
      await mutate(
        "isContentAdd",
        "isContentAdded",
        async () => {
          await courseApi.postCourseContent(courseId, title, youtube);
          return "";
        },
        "Konten berhasil ditambahkan!"
      );
    },
    async asyncSetIsContentChange(contentId: EntityId, title: string, youtube: string) {
      await mutate(
        "isContentChange",
        "isContentChanged",
        () => courseApi.putCourseContent(contentId, title, youtube),
        "Konten berhasil diubah!"
      );
    },
    async asyncSetIsContentDelete(contentId: EntityId) {
      await mutate(
        "isContentDelete",
        "isContentDeleted",
        () => courseApi.deleteCourseContent(contentId),
        "Konten berhasil dihapus!"
      );
    },
    async asyncSetIsContentLearn(contentId: EntityId, status: 0 | 1) {
      await mutate(
        "isContentLearn",
        "isContentLearned",
        () => courseApi.postCourseContentLearn(contentId, status),
        "Status belajar berhasil diubah!"
      );
    },
  };

  const accessors: PropertyDescriptorMap = {};
  for (const key of Object.keys(initialState) as (keyof CoursesState)[]) {
    accessors[key] = { get: () => currentState[key], enumerable: true };
    accessors[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = {
      value: (value: unknown) => innerStore.update((s) => ({ ...s, [key]: value })),
      enumerable: true,
    };
  }

  return Object.defineProperties(store, accessors) as typeof store &
    Readonly<CoursesState> &
    CoursesSetters;
}

export const coursesStore = createCoursesStore();
export const useCoursesStore = () => coursesStore;
export default coursesStore;
