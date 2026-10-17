<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import {
    formatDate,
    getAssetUrl,
    handleImageError,
    showConfirmDialog,
    showErrorDialog,
  } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Users,
    Star,
    Plus,
    Video,
    CheckCircle2,
    Circle,
    UserPlus,
    UserMinus,
    MessageSquare,
    LoaderCircle,
  } from "lucide-svelte";
  import type { CourseContent } from "../api/courseApi";

  export let courseId: string | number;

  $: profile = $usersStore.profile;
  $: course = $coursesStore.course;

  let showCoverModal: boolean = false;
  let showEditModal: boolean = false;
  let showContentModal: boolean = false;
  let selectedContent: CourseContent | null = null;

  // Rating input state
  let ratingScore: number = 5;
  let ratingComment: string = "";
  let submittingRating: boolean = false;

  onMount(() => {
    if (courseId) {
      coursesStore.asyncSetCourse(courseId);
    }
  });

  let prevId = courseId;
  $: if (courseId !== prevId) {
    prevId = courseId;
    coursesStore.asyncSetCourse(courseId);
  }

  $: if ($coursesStore.isCourse) {
    coursesStore.setIsCourse(false);
    if (!course) {
      goto("/");
    }
  }

  $: if ($coursesStore.isCourseDeleted) {
    coursesStore.setIsCourseDeleted(false);
    goto("/");
  }

  $: if ($coursesStore.isStudentChange) {
    coursesStore.setIsStudentChange(false);
    if ($coursesStore.isStudentChanged) {
      coursesStore.setIsStudentChanged(false);
      coursesStore.asyncSetCourse(courseId);
    }
  }

  $: if ($coursesStore.isRatingChange) {
    submittingRating = false;
    coursesStore.setIsRatingChange(false);
    if ($coursesStore.isRatingChanged) {
      coursesStore.setIsRatingChanged(false);
      coursesStore.asyncSetCourse(courseId);
      ratingComment = "";
    }
  }

  $: if ($coursesStore.isContentDelete) {
    coursesStore.setIsContentDelete(false);
    if ($coursesStore.isContentDeleted) {
      coursesStore.setIsContentDeleted(false);
      coursesStore.asyncSetCourse(courseId);
    }
  }

  $: isOwner = !!(profile && course && String(course.user_id) === String(profile.id));
  $: isStudent = !!(
    profile &&
    course &&
    !isOwner &&
    (course.students || []).some((s) => String(s) === String(profile?.id))
  );

  async function handleDeleteCourse() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDelete(course.id);
    }
  }

  async function handleJoinCourse() {
    coursesStore.asyncSetIsStudentJoin(course.id);
  }

  async function handleLeaveCourse() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin keluar dari kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsStudentLeave(course.id);
    }
  }

  function handleAddContent() {
    selectedContent = null;
    showContentModal = true;
  }

  function handleEditContent(item: CourseContent) {
    selectedContent = item;
    showContentModal = true;
  }

  async function handleDeleteContent(contentId: string | number) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus materi ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsContentDelete(contentId);
    }
  }

  async function handleSubmitRating() {
    const score = Number(ratingScore);
    if (isNaN(score) || score < 1 || score > 5) {
      showErrorDialog("Rating harus berada dalam skala 1 sampai 5");
      return;
    }
    submittingRating = true;
    coursesStore.asyncSetIsRatingChange(course.id, Number(ratingScore), ratingComment.trim());
  }
</script>

{#if !profile || !course}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p class="text-sm font-medium text-slate-500 mt-2">Memuat detail kursus...</p>
  </div>
{:else}
  <div class="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-courses-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Kursus
      </a>

      <!-- Role-based actions -->
      <div class="flex flex-wrap items-center gap-2">
        {#if isOwner}
          <button
            type="button"
            data-testid="add-content-btn"
            on:click={handleAddContent}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-700 hover:bg-indigo-800 shadow-sm transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Tambah Materi
          </button>
          <button
            type="button"
            data-testid="edit-cover-btn"
            on:click={() => (showCoverModal = true)}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
          >
            <ImagePlus size={16} />
            Ubah Cover
          </button>
          <button
            type="button"
            data-testid="edit-detail-course-btn"
            on:click={() => (showEditModal = true)}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            <PenLine size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-course-btn"
            on:click={handleDeleteCourse}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        {:else if isStudent}
          <button
            type="button"
            data-testid="leave-course-btn"
            on:click={handleLeaveCourse}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <UserMinus size={16} />
            Keluar Kursus
          </button>
        {:else}
          <button
            type="button"
            data-testid="join-course-btn"
            on:click={handleJoinCourse}
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-600/25 transition-colors"
          >
            <UserPlus size={16} />
            Daftar Kursus
          </button>
        {/if}
      </div>
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if course.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={getAssetUrl(course.cover)}
            alt={course.title}
            width="1280"
            height="320"
            fetchpriority="high"
            decoding="async"
            on:error={handleImageError}
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-mono text-xs font-bold text-slate-600">
              #{course.id}
            </span>
            {#if isOwner}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Pemilik Kursus
              </span>
            {:else if isStudent}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Terdaftar sebagai Peserta
              </span>
            {/if}

            {#if course.avg_ratings}
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Star size={13} class="fill-amber-400 text-amber-500" />
                {Number(course.avg_ratings).toFixed(1)} / 5
              </span>
            {/if}
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {course.title}
          </h1>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
            <div class="flex items-center gap-1.5">
              <Users size={14} class="shrink-0 text-slate-600" />
              <span>Instruktur: <strong class="text-slate-800">{course.author?.name || "Pengajar"}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0 text-slate-600" />
              <span>Dibuat: <strong class="text-slate-800">{formatDate(course.created_at)}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0 text-slate-600" />
              <span>Diperbarui: <strong class="text-slate-800">{formatDate(course.updated_at)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-600">
            Deskripsi Kursus
          </h2>
          <div
            data-testid="course-detail-description"
            class="text-slate-700 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 leading-relaxed text-sm whitespace-pre-wrap"
          >
            {#if course.description}
              {course.description}
            {:else}
              <p class="italic text-slate-600">Tidak ada deskripsi rinci untuk kursus ini.</p>
            {/if}
          </div>
        </div>

        <!-- Course Contents List -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900">Materi Pembelajaran</h2>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {(course.contents || []).length} materi
              </span>
            </div>

            {#if isOwner}
              <button
                type="button"
                data-testid="add-content-inline-btn"
                on:click={handleAddContent}
                class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                <Plus size={16} /> Tambah Materi
              </button>
            {/if}
          </div>

          {#if !course.contents || course.contents.length === 0}
            <div class="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <Video size={36} class="mx-auto text-slate-400 mb-2" />
              <p class="text-sm font-medium text-slate-700">Belum ada materi pada kursus ini.</p>
              {#if isOwner}
                <button
                  type="button"
                  data-testid="add-first-content-btn"
                  on:click={handleAddContent}
                  class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800"
                >
                  <Plus size={14} /> Tambah Materi Sekarang
                </button>
              {/if}
            </div>
          {:else}
            <div class="space-y-2.5">
              {#each course.contents as item (item.id)}
                <div
                  data-testid={`content-item-${item.id}`}
                  class="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-xs transition-all group"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Video size={20} />
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                        {item.title}
                      </h3>
                      <div class="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                        <span class="truncate max-w-[200px] sm:max-w-xs">{item.youtube}</span>
                        {#if item.my_status_finished}
                          <span class="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 size={13} /> Selesai
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1 text-slate-600">
                            <Circle size={13} /> Belum
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid={`view-content-${item.id}`}
                      on:click={() => goto(`/courses/${course.id}/contents/${item.id}`)}
                      class="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Buka Materi
                    </button>

                    {#if isOwner}
                      <button
                        type="button"
                        data-testid={`edit-content-${item.id}`}
                        on:click={() => handleEditContent(item)}
                        class="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        aria-label="Ubah Materi"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-content-${item.id}`}
                        on:click={() => handleDeleteContent(item.id)}
                        class="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Hapus Materi"
                      >
                        <Trash2 size={16} />
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Student Ratings Section -->
        <div class="space-y-4 pt-6 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900">Ulasan & Rating Peserta</h2>
            {#if course.avg_ratings}
              <div class="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                <Star size={16} class="fill-amber-400 text-amber-500" />
                <span>{course.avg_ratings}</span>
              </div>
            {/if}
          </div>

          <!-- Add / Update Rating Form for enrolled students -->
          {#if isStudent}
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 class="text-sm font-bold text-slate-800">Beri Ulasan Kursus Ini</h3>
              <form on:submit|preventDefault={handleSubmitRating} class="space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <label for="rating-select-score" class="block text-xs font-semibold text-slate-600 mb-1">
                      Skala Rating (1-5)
                    </label>
                    <select
                      id="rating-select-score"
                      data-testid="rating-score-select"
                      bind:value={ratingScore}
                      class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value={0} class="hidden">0</option>
                      <option value={1}>1 - Kurang</option>
                      <option value={2}>2 - Cukup</option>
                      <option value={3}>3 - Baik</option>
                      <option value={4}>4 - Sangat Baik</option>
                      <option value={5}>5 - Luar Biasa</option>
                    </select>
                  </div>

                  <div class="flex-1">
                    <label for="rating-comment-input" class="block text-xs font-semibold text-slate-600 mb-1">
                      Komentar Ulasan
                    </label>
                    <input
                      id="rating-comment-input"
                      type="text"
                      data-testid="rating-comment-input"
                      bind:value={ratingComment}
                      placeholder="Bagikan pengalaman belajar Anda pada kursus ini..."
                      class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    data-testid="submit-rating-btn"
                    disabled={submittingRating}
                    class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs transition-colors disabled:opacity-60"
                  >
                    {#if submittingRating}
                      <LoaderCircle size={14} class="animate-spin" />
                      <span>Mengirim...</span>
                    {:else}
                      <Star size={14} />
                      <span>Kirim Ulasan</span>
                    {/if}
                  </button>
                </div>
              </form>
            </div>
          {/if}

          <!-- Existing Ratings List -->
          {#if !course.ratings || course.ratings.length === 0}
            <p class="text-xs text-slate-600 italic">Belum ada ulasan dari peserta untuk kursus ini.</p>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {#each course.ratings as rate, idx (idx)}
                <div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800">{rate.name}</span>
                    <div class="flex items-center gap-0.5 text-amber-500">
                      {#each Array(rate.ratings) as _}
                        <Star size={12} class="fill-amber-400 text-amber-500" />
                      {/each}
                    </div>
                  </div>
                  {#if rate.comment}
                    <p class="text-xs text-slate-600">{rate.comment}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangeCoverModal
      show={showCoverModal}
      {course}
      onClose={() => (showCoverModal = false)}
      on:close={() => (showCoverModal = false)}
    />

    <ChangeModal
      show={showEditModal}
      courseId={course.id}
      onClose={() => (showEditModal = false)}
      on:close={() => (showEditModal = false)}
    />

    <ContentModal
      show={showContentModal}
      courseId={course.id}
      content={selectedContent}
      onClose={() => (showContentModal = false)}
      on:close={() => (showContentModal = false)}
    />
  </div>
{/if}
