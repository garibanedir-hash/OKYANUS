export type ExportFormat = "csv" | "xlsx" | "pdf";

export type DonationExportFilters = {
  dateFrom?: string;
  dateTo?: string;
  projectSlug?: string;
  donationType?: string;
  paymentStatus?: string;
  receiptStatus?: string;
  maskPersonalData?: boolean;
  summaryOnly?: boolean;
};

export type DonationExportRow = {
  id: string;
  donorName: string;
  amount: number;
  donationType: string;
  projectSlug: string;
  date: string;
  status: string;
  paymentStatus: string;
  receiptStatus: string;
  note: string;
};

export type PreparedDonationExport = {
  format: ExportFormat;
  filename: string;
  rowCount: number;
  masked: boolean;
  summaryOnly: boolean;
  rows: DonationExportRow[];
  content?: string;
};
