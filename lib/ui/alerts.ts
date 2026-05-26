import type { SweetAlertIcon } from "sweetalert2";

type AlertOptions = {
  title?: string;
  text: string;
  confirmButtonText?: string;
};

type ConfirmOptions = AlertOptions & {
  cancelButtonText?: string;
};

const customClass = {
  popup: "rounded-xl border border-slate-200 shadow-xl",
  title: "text-slate-900",
  htmlContainer: "text-slate-600",
  confirmButton:
    "rounded-lg bg-[#22d3ee] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-cyan-300",
  cancelButton:
    "rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200",
};

async function getSwal() {
  const { default: Swal } = await import("sweetalert2");
  return Swal;
}

async function showAlert(icon: SweetAlertIcon, options: AlertOptions) {
  const Swal = await getSwal();

  await Swal.fire({
    icon,
    title: options.title,
    text: options.text,
    confirmButtonText: options.confirmButtonText || "OK",
    buttonsStyling: false,
    customClass,
  });
}

export async function showSuccess(text: string, title = "Success") {
  await showAlert("success", { title, text });
}

export async function showError(text: string, title = "Something went wrong") {
  await showAlert("error", { title, text });
}

export async function showInfo(text: string, title = "Notice") {
  await showAlert("info", { title, text });
}

export async function requireInfoConfirmation({
  title = "Notice",
  text,
  confirmButtonText = "OK",
}: AlertOptions): Promise<boolean> {
  const Swal = await getSwal();

  const result = await Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: false,
    customClass,
  });

  return result.isConfirmed;
}

export async function confirmAction({
  title = "Are you sure?",
  text,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}: ConfirmOptions): Promise<boolean> {
  const Swal = await getSwal();

  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      ...customClass,
      confirmButton:
        "rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200",
    },
  });

  return result.isConfirmed;
}
