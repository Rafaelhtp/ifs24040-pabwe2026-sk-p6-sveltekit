<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Plus, X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show: boolean = false;
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let title: string = "";
  let description: string = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: if ($coursesStore.isCourseAdd) {
    loading = false;
    coursesStore.setIsCourseAdd(false);
    if ($coursesStore.isCourseAdded) {
      coursesStore.setIsCourseAdded(false);
      coursesStore.asyncSetCourses();
      title = "";
      description = "";
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

    loading = true;
    coursesStore.asyncSetIsCourseAdd(title.trim(), description.trim());
  }
</script>

{#if show}
  <div
    data-testid="add-course-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-course-modal-title"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 id="add-course-modal-title" class="text-base font-bold text-slate-800">
              Tambah Kursus Baru
            </h2>
            <p class="text-xs text-slate-600">
              Buat materi dan kursus baru untuk dipelajari peserta
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-add-modal-btn"
          aria-label="Tutup modal tambah kursus"
          on:click={handleClose}
          class="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={handleSave}>
        <div class="p-6 space-y-4">
          <div>
            <label
              for="add-course-title-input"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Judul Kursus <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="add-course-title-input"
              type="text"
              data-testid="add-course-title-input"
              bind:value={title}
              placeholder="Contoh: Belajar SvelteKit dari Nol"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label
              for="add-course-description-input"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Deskripsi Kursus <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="add-course-description-input"
              data-testid="add-course-description-input"
              bind:value={description}
              rows={4}
              placeholder="Tuliskan deskripsi lengkap mengenai tujuan dan silabus kursus ini..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
              required
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            data-testid="cancel-add-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Kursus</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
