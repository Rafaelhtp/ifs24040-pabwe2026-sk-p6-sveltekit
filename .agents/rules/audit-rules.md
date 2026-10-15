# PABWE 2026 - Studi Kasus 2 (SvelteKit) Mandatory Rules

1. **Test & Check Commands**:
   - DILARANG menjalankan `bun test`. Selalu gunakan `bun run test` atau `bun run test:coverage`.
   - Selalu pastikan `bun run check` menghasilkan 0 errors dan 0 warnings.
   - Jangan ubah `"extends": "$app/tsconfig"` di dalam `tsconfig.json`.

2. **100% Coverage Gate**:
   - Jangan berhenti bekerja sebelum `bun run test:coverage` mencapai 100% pada Statements, Branches, Functions, dan Lines.

3. **SvelteKit 3 & Svelte 5 Strict Rules**:
   - DILARANG mengimpor `$app/stores`. Gunakan `page` dari `$app/state` dan baca parameter rute dengan `$derived(page.params.courseId)` serta `$derived(page.params.contentId)`.
   - Gunakan `goto("/")` dari `$app/navigation` setelah login berhasil dan profil tersedia.
   - Saat menguji klik pada komponen Svelte 5 di Vitest, WAJIB panggil `element.click()`.

4. **Lucide Icons Restriction**:
   - Logo wajib memakai `GraduationCap` dari `lucide-svelte`.
   - Ikon video WAJIB memakai `Video` dari `lucide-svelte` (DILARANG mengimpor `Youtube` karena tidak ada di `lucide-svelte`).

5. **Check UI Auto-Grader & Accessibility**:
   - Halaman `/auth/login` WAJIB memiliki `#login-email-input`, `#login-password-input`, dan `#login-submit-button`.
   - Fallback `DELCOM_BASEURL` wajib mengarah ke `https://open-api.delcom.org/api/v1` (bukan localhost).
   - Semua input wajib memiliki `<label for="...">` atau `aria-label`, semua tombol ikon memiliki `aria-label`, semua `<img>` memiliki `alt`, dan `<iframe>` YouTube memiliki `title`.