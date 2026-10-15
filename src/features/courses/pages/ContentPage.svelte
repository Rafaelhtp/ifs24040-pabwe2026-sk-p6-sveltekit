<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Video,
    LoaderCircle,
  } from "lucide-svelte";

  export let courseId: string | number;
  export let contentId: string | number;

  $: profile = $usersStore.profile;
  $: content = $coursesStore.courseContent;
  $: course = $coursesStore.course;

  let togglingStatus: boolean = false;

  onMount(() => {
    coursesStore.asyncSetCourseContent(contentId);
    coursesStore.asyncSetCourse(courseId);
  });

  let prevContentId = contentId;
  $: if (contentId !== prevContentId) {
    prevContentId = contentId;
    coursesStore.asyncSetCourseContent(contentId);
  }

  $: if ($coursesStore.isCourseContent) {
    coursesStore.setIsCourseContent(false);
    if (!content) {
      goto(`/courses/${courseId}`);
    }
  }

  $: if ($coursesStore.isContentLearn) {
    togglingStatus = false;
    coursesStore.setIsContentLearn(false);
    if ($coursesStore.isContentLearned) {
      coursesStore.setIsContentLearned(false);
      coursesStore.asyncSetCourseContent(contentId);
    }
  }

  function getEmbedUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1]?.split("&")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
  }

  $: embedUrl = getEmbedUrl(content?.youtube);
  $: isFinished = !!(content && (content.my_status_finished === true || content.my_status_finished === 1));

  const videoSrcdoc =
    '<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%;background:#0f172a;font-family:sans-serif}button{width:100%;height:100%;border:0;background:transparent;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:12px}.play{background:#dc2626;padding:14px 28px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 10px 25px rgba(220,38,38,0.4)}</style><button type="button" onclick="window.frameElement.removeAttribute(\'srcdoc\')"><span class="play">▶ Putar Video Materi</span></button>';

  async function handleToggleStatus() {
    togglingStatus = true;
    const nextStatus = isFinished ? 0 : 1;
    coursesStore.asyncSetIsContentLearn(content.id, nextStatus);
  }
</script>

{#if !profile || !content}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
    <p class="text-sm font-medium text-slate-600 mt-2">Memuat materi pembelajaran...</p>
  </div>
{:else}
  <div class="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
    <!-- Back to Course Link -->
    <div class="flex items-center justify-between">
      <a
        href={`/courses/${courseId}`}
        data-testid="back-to-course-detail-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Kursus {course?.title ? `(${course.title})` : ""}
      </a>

      <!-- Status badge -->
      <div>
        {#if isFinished}
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} /> Selesai Dipelajari
          </span>
        {:else}
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Circle size={14} /> Belum Selesai
          </span>
        {/if}
      </div>
    </div>

    <!-- Video Player Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="relative w-full aspect-video bg-black">
        {#if embedUrl}
          <iframe
            src={embedUrl}
            srcdoc={videoSrcdoc}
            title={`Video Materi: ${content.title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="w-full h-full border-0"
          ></iframe>
        {:else}
          <div class="w-full h-full flex flex-col items-center justify-center text-white/70">
            <Video size={48} class="mb-2" />
            <p class="text-sm">Video tidak tersedia</p>
          </div>
        {/if}
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div class="space-y-1">
            <span class="font-mono text-xs font-bold text-slate-600">
              Materi #{content.id}
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.title}
            </h1>
          </div>

          <!-- Mark Finished / Incomplete Button -->
          <button
            type="button"
            data-testid="toggle-learn-status-btn"
            on:click={handleToggleStatus}
            disabled={togglingStatus}
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs {isFinished ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 shadow-emerald-600/20'}"
          >
            {#if togglingStatus}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Memproses...</span>
            {:else if isFinished}
              <Circle size={16} />
              <span>Tandai Belum Selesai</span>
            {:else}
              <CheckCircle2 size={16} />
              <span>Tandai Sudah Selesai</span>
            {/if}
          </button>
        </div>

        <div class="space-y-2">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-600">
            Tautan Pembelajaran
          </h2>
          <p class="text-sm font-mono text-indigo-700 break-all bg-slate-50 p-3 rounded-xl border border-slate-100">
            {content.youtube}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
