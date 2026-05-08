import type { MockDonation } from "@/data/adminMock";
import { projects } from "@/data/projects";
import { generateCsv } from "@/lib/export/csv";
import type { DonationExportFilters, DonationExportRow, ExportFormat, PreparedDonationExport } from "@/lib/export/exportTypes";

export function maskPersonalData(value: string) {
  if (!value) {
    return "";
  }

  const [first = "", rest = ""] = value.split(" ");
  return `${first.slice(0, 2)}***${rest ? ` ${rest.slice(0, 1)}***` : ""}`;
}

export function mapDonationToExportRow(donation: MockDonation, mask = true): DonationExportRow {
  const project = projects.find((item) => item.slug === donation.projectSlug);

  return {
    id: donation.id,
    donorName: mask ? maskPersonalData(donation.donorName) : donation.donorName,
    amount: donation.amount,
    donationType: donation.donationType,
    projectSlug: project?.slug ?? "genel-bagis",
    date: donation.date,
    status: donation.status,
    paymentStatus: donation.paymentStatus,
    receiptStatus: donation.receiptStatus,
    note: donation.note ?? ""
  };
}

export function filterDonations(donations: MockDonation[], filters: DonationExportFilters) {
  return donations.filter((donation) => {
    if (filters.projectSlug && filters.projectSlug !== "all" && donation.projectSlug !== filters.projectSlug) return false;
    if (filters.donationType && filters.donationType !== "all" && donation.donationType !== filters.donationType) return false;
    if (filters.paymentStatus && filters.paymentStatus !== "all" && donation.paymentStatus !== filters.paymentStatus) return false;
    if (filters.receiptStatus && filters.receiptStatus !== "all" && donation.receiptStatus !== filters.receiptStatus) return false;
    if (filters.dateFrom || filters.dateTo) {
      const donationDate = new Date(donation.date);
      if (filters.dateFrom && !Number.isNaN(donationDate.valueOf()) && donationDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && !Number.isNaN(donationDate.valueOf()) && donationDate > new Date(filters.dateTo)) return false;
    }
    return true;
  });
}

export function generateDonationCsv(rows: DonationExportRow[]) {
  return generateCsv(rows);
}

export function prepareDonationExport(
  donations: MockDonation[],
  filters: DonationExportFilters,
  format: ExportFormat = "csv"
): PreparedDonationExport {
  const filtered = filterDonations(donations, filters);
  const rows = filtered.map((donation) => mapDonationToExportRow(donation, filters.maskPersonalData ?? true));
  const filename = `okyanus-bagis-raporu-${new Date().toISOString().slice(0, 10)}.${format}`;

  return {
    format,
    filename,
    rowCount: rows.length,
    masked: filters.maskPersonalData ?? true,
    summaryOnly: filters.summaryOnly ?? false,
    rows,
    content: format === "csv" ? generateDonationCsv(rows) : undefined
  };
}
