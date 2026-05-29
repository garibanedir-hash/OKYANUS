"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-deep-blue px-4 py-2 text-sm font-extrabold text-white hover:bg-dark-navy"
    >
      Yazdır
    </button>
  );
}
