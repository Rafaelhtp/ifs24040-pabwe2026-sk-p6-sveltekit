import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
  getAssetUrl,
  handleImageError,
  FALLBACK_IMAGE_SRC,
} from "./toolsHelper";

declare const DELCOM_BASEURL: string;

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    await showErrorDialog("Error test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    (Swal.fire as any).mockResolvedValue({ isConfirmed: false });
    await showErrorDialog("Error test");
  });

  it("should call Swal.fire for showWarningDialog and handle confirmation", async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    await showWarningDialog("Warning test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    (Swal.fire as any).mockResolvedValue({ isConfirmed: false });
    await showWarningDialog("Warning test");
  });

  it("should call Swal.fire for showSuccessDialog and handle confirmation", async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    await showSuccessDialog("Success test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    (Swal.fire as any).mockResolvedValue({ isConfirmed: false });
    await showSuccessDialog("Success test");
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
    const res = await showConfirmDialog("Confirm test?");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-02-26T02:34:26.000000Z");
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });

  it("getAssetUrl should keep absolute URLs and prefix relative paths with the API origin", () => {
    const origin = new URL(DELCOM_BASEURL).origin;
    expect(getAssetUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(getAssetUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(getAssetUrl("//cdn.test/a.png")).toBe("//cdn.test/a.png");
    expect(getAssetUrl("storage/a.png")).toBe(`${origin}/storage/a.png`);
    expect(getAssetUrl("/storage/a.png")).toBe(`${origin}/storage/a.png`);
  });

  it("handleImageError should replace a broken image source with the inline fallback", () => {
    const img = document.createElement("img");
    img.src = "https://example.com/broken.jpg";
    const event = new Event("error");
    Object.defineProperty(event, "currentTarget", { value: img });

    handleImageError(event);

    expect(img.getAttribute("src")).toBe(FALLBACK_IMAGE_SRC);
    expect(FALLBACK_IMAGE_SRC.startsWith("data:image/svg+xml,")).toBe(true);
  });
});
