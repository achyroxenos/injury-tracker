"use client";

import dynamic from "next/dynamic";
import { FileText, Loader2 } from "lucide-react";
import { Injury } from "@/context/injury-context";
import { MedicalReport } from "./medical-report";

// Dynamically import PDFDownloadLink to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <button className="p-2 opacity-50"><Loader2 className="w-5 h-5 animate-spin" /></button>,
    }
);

export function ExportReportButton({ injury }: { injury: Injury }) {
    return (
        <PDFDownloadLink
            document={<MedicalReport injury={injury} />}
            fileName={`injury-report-${injury.bodyPart.toLowerCase().replace(/\s/g, '-')}.pdf`}
            className="bg-card hover:bg-secondary text-foreground p-2 rounded-full border shadow-sm transition-colors flex items-center justify-center"
        >
            {({ loading }) =>
                loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                    <FileText className="w-4 h-4 text-primary" />
                )
            }
        </PDFDownloadLink>
    );
}
