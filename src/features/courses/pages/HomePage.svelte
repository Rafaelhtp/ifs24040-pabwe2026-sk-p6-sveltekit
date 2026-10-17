<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, getAssetUrl, handleImageError, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    GraduationCap,
    BookOpen,
    UserCheck,
    Eye,
    Pencil,
    Trash2,
    Funnel,
    Search,
    LoaderCircle,
  } from "lucide-svelte";
  import type { Course } from "../api/courseApi";

  let loadingCourses: boolean = false;
  let filterMyCourses: boolean = false;
  let searchQuery: string = "";
  let showAddModal: boolean = false;
  let showChangeModal: boolean = false;
  let selectedCourseId: string | number | null = null;

  $: profile = $usersStore.profile;
  $: courses = $coursesStore.courses || [];

  onMount(() => {
    loadCourses();
  });

  function loadCourses() {
    loadingCourses = true;
    Promise.resolve(coursesStore.asyncSetCourses(filterMyCourses)).finally(() => {
      loadingCourses = false;
    });
  }

  let prevFilter = filterMyCourses;
  $: if (filterMyCourses !== prevFilter) {
    prevFilter = filterMyCourses;
    loadCourses();
  }

  $: if ($coursesStore.isCourseDeleted) {
    coursesStore.setIsCourseDeleted(false);
    loadCourses();
  }

  function handleEditCourse(courseId: string | number) {
    selectedCourseId = courseId;
    showChangeModal = true;
  }

  async function handleDeleteCourse(courseId: string | number) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDelete(courseId);
    }
  }

  async function handleDeleteAllCourses() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus semua kursus?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDeleteAll();
    }
  }

  $: filteredCourses = courses.filter((course: Course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = course.title ? course.title.toLowerCase() : "";
    const description = course.description ? course.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  $: totalCount = courses.length;
  $: myCoursesCount = courses.filter((c: Course) => profile && String(c.user_id) === String(profile.id)).length;
  $: studentCoursesCount = courses.filter((c: Course) => profile && (c.students || []).some((s) => String(s) === String(profile?.id))).length;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Kursus
        </h1>
        <p class="text-sm text-slate-600 mt-1">
          Kelola dan ikuti berbagai kursus pembelajaran daring interaktif.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          data-testid="delete-all-courses-btn"
          on:click={handleDeleteAllCourses}
          class="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
        >
          <Trash2 size={16} />
          <span>Hapus Semua</span>
        </button>

        <button
          type="button"
          data-testid="add-course-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Kursus</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Total Kursus
          </p>
          <h2 class="text-3xl font-black text-slate-800 mt-1">{totalCount}</h2>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <BookOpen size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Kursus Saya
          </p>
          <h2 class="text-3xl font-black text-indigo-700 mt-1">
            {myCoursesCount}
          </h2>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <GraduationCap size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Kursus Diikuti
          </p>
          <h2 class="text-3xl font-black text-emerald-700 mt-1">{studentCoursesCount}</h2>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <UserCheck size={26} strokeWidth={2} />
        </div>
      </div>
    </div>

    <!-- Table & Controls Section -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Filter bar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <label for="search-course-input" class="sr-only">Cari judul atau materi kursus</label>
          <Search
            size={18}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            id="search-course-input"
            type="text"
            data-testid="search-course-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau materi kursus..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Funnel size={16} /> Filter:
          </span>
          <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              data-testid="filter-all-btn"
              on:click={() => (filterMyCourses = false)}
              class="px-3 py-1.5 rounded-lg transition-all {!filterMyCourses ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}"
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="filter-my-courses-btn"
              on:click={() => (filterMyCourses = true)}
              class="px-3 py-1.5 rounded-lg transition-all {filterMyCourses ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}"
            >
              Milik Saya
            </button>
          </div>
        </div>
      </div>

      <!-- Responsive Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-700 border-b border-slate-100">
            <tr>
              <th scope="col" class="px-5 py-3.5 text-center w-16">ID</th>
              <th scope="col" class="px-5 py-3.5">Kursus</th>
              <th scope="col" class="px-5 py-3.5 hidden md:table-cell">Pengajar</th>
              <th scope="col" class="px-5 py-3.5 hidden lg:table-cell">Diperbarui</th>
              <th scope="col" class="px-5 py-3.5 text-center">Materi</th>
              <th scope="col" class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#if loadingCourses && filteredCourses.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-600">
                  <LoaderCircle size={36} class="mx-auto text-indigo-700 animate-spin mb-2" />
                  <p class="font-medium text-slate-700">Memuat daftar kursus...</p>
                </td>
              </tr>
            {:else if filteredCourses.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-600">
                  <GraduationCap size={40} class="mx-auto text-slate-400 mb-2" />
                  <p class="font-medium">Belum ada data kursus yang cocok.</p>
                </td>
              </tr>
            {:else}
              {#each filteredCourses as course (course.id)}
                <tr
                  data-testid={`course-row-${course.id}`}
                  class="hover:bg-slate-50/70 transition-colors group"
                >
                  <td class="px-5 py-4 text-center font-mono text-xs font-bold text-slate-600">
                    {"#" + course.id}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      {#if course.cover}
                        <img
                          src={getAssetUrl(course.cover)}
                          alt={course.title}
                          width="40"
                          height="40"
                          loading="lazy"
                          decoding="async"
                          on:error={handleImageError}
                          class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      {:else}
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                          <BookOpen size={20} />
                        </div>
                      {/if}
                      <div>
                        <p class="font-semibold text-slate-800 leading-snug">
                          {course.title}
                        </p>
                        {#if course.description}
                          <p class="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {course.description}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell text-xs text-slate-600">
                    {course.author?.name || "Instruktur"}
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell text-xs text-slate-600">
                    {formatDate(course.updated_at || course.created_at)}
                  </td>
                  <td class="px-5 py-4 text-center text-xs font-semibold text-slate-700">
                    {course.total_contents || 0}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`view-course-${course.id}`}
                        on:click={() => goto(`/courses/${course.id}`)}
                        class="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        aria-label="Lihat Detail Kursus"
                      >
                        <Eye size={18} />
                      </button>
                      {#if profile && String(course.user_id) === String(profile.id)}
                        <button
                          type="button"
                          data-testid={`edit-course-${course.id}`}
                          on:click={() => handleEditCourse(course.id)}
                          class="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          aria-label="Ubah Kursus"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          data-testid={`delete-course-${course.id}`}
                          on:click={() => handleDeleteCourse(course.id)}
                          class="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Hapus Kursus"
                        >
                          <Trash2 size={18} />
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddModal
      show={showAddModal}
      onClose={() => (showAddModal = false)}
      on:close={() => (showAddModal = false)}
    />
    <ChangeModal
      show={showChangeModal}
      courseId={selectedCourseId}
      onClose={() => (showChangeModal = false)}
      on:close={() => (showChangeModal = false)}
    />
  </div>
{/if}
