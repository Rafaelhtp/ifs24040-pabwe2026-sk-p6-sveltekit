<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PenLine, X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import courseApi from "../api/courseApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show: boolean = false;
  export let courseId: string | number | null = null;
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let fetchingCourse: boolean = false;
  let title: string = "";
  let description: string = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: if (show && courseId) {
    loadCourseData(courseId);
  }

  async function loadCourseData(id: string | number) {
    fetchingCourse = true;
    try {
      const course = await courseApi.getCourseById(id);
      title = course?.title || "";
      description = course?.description || "";
    } catch {
      showErrorDialog("Gagal mengambil data kursus");
      handleClose();
    } finally {
      fetchingCourse = false;
    }
  }

  $: if ($coursesStore.isCourseChange) {
    loading = false;
    coursesStore.setIsCourseChange(false);
    if ($coursesStore.isCourseChanged) {
      coursesStore.setIsCourseChanged(false);
      coursesStore.asyncSetCourses();
      coursesStore.asyncSetCourse(courseId);
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul kursus tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi kursus tidak boleh kosong");
      return;
    }

    if (!courseId) {
      return;
    }

    loading = true;
    coursesStore.asyncSetIsCourseChange(courseId, title.trim(), description.trim());
  }
</script>

{#if show}
  <div
    data-testid="edit-course-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-course-modal-title"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <PenLine size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 id="edit-course-modal-title" class="text-base font-bold text-slate-800">
              Ubah Data Kursus
            </h2>
            <p class="text-xs text-slate-600">
              Perbarui judul dan rincian deskripsi materi kursus
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-edit-modal-btn"
          aria-label="Tutup modal ubah kursus"
          on:click={handleClose}
          class="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={handleSave}>
        <div class="p-6 space-y-4">
          {#if fetchingCourse}
            <div class="flex items-center justify-center py-12">
              <LoaderCircle size={32} class="animate-spin text-amber-600" />
            </div>
          {:else}
            <div>
              <label
                for="edit-course-title-input"
                class="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Judul Kursus <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="edit-course-title-input"
                type="text"
                data-testid="edit-course-title-input"
                bind:value={title}
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                required
              />
            </div>

            <div>
              <label
                for="edit-course-description-input"
                class="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Deskripsi Kursus <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <textarea
                id="edit-course-description-input"
                data-testid="edit-course-description-input"
                bind:value={description}
                rows={5}
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all resize-y"
                required
              ></textarea>
            </div>
          {/if}
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            data-testid="cancel-edit-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-edit-modal-btn"
            disabled={loading || fetchingCourse}
            class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <PenLine size={18} strokeWidth={2.5} />
              <span>Perbarui Kursus</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
