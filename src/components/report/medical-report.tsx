"use client";

import React from "react";
import { Page, Text, View, Document, StyleSheet, Image as PdfImage, Font } from "@react-pdf/renderer";
import { Injury } from "@/context/injury-context";

// Register fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v1/1.ttf' }, // Fallback to standard font if needed
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#334155",
        backgroundColor: "#F1F5F9",
        padding: 4,
    },
    row: {
        flexDirection: "row",
        marginBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: "#E2E8F0",
        paddingBottom: 8,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        color: "#64748B",
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        color: "#0F172A",
    },
    image: {
        width: 200,
        height: 200,
        objectFit: "cover",
        borderRadius: 4,
        marginBottom: 4,
    },
    logEntry: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#F8FAFC",
        borderRadius: 4,
    },
    tag: {
        fontSize: 8,
        padding: 4,
        backgroundColor: "#E2E8F0",
        borderRadius: 4,
        marginRight: 4,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 10,
        color: "#94A3B8",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingTop: 10,
    }
});

export const MedicalReport = ({ injury }: { injury: Injury }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Injury Report: {injury.bodyPart}</Text>
                <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
            </View>

            {/* Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Type</Text>
                        <Text style={styles.value}>{injury.type === "illness" ? "Illness" : "Physical Injury"}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Start Date</Text>
                        <Text style={styles.value}>{new Date(injury.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Cause/Diagnosis</Text>
                        <Text style={styles.value}>{injury.cause}</Text>
                    </View>
                </View>
            </View>

            {/* Logs */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline of Updates</Text>
                {injury.logs.map((log) => (
                    <View key={log.id} style={styles.logEntry}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{new Date(log.date).toLocaleString()}</Text>
                            <Text style={{ fontSize: 12, color: log.painLevel > 5 ? '#EF4444' : '#10B981' }}>
                                {log.temperature ? `${log.temperature}°C` : `Pain: ${log.painLevel}/10`}
                            </Text>
                        </View>

                        {log.imageUrl && (
                            <PdfImage src={log.imageUrl} style={styles.image} />
                        )}

                        <Text style={styles.label}>Notes:</Text>
                        <Text style={{ fontSize: 11, marginBottom: 6 }}>{log.notes || "No notes."}</Text>

                        {/* Symptoms / Treatments */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {log.symptoms?.map(s => (
                                <Text key={s} style={[styles.tag, { backgroundColor: '#FEF3C7', color: '#B45309' }]}>{s}</Text>
                            ))}
                            {log.treatments?.map(t => (
                                <Text key={t.id} style={[styles.tag, { backgroundColor: '#DBEAFE', color: '#1E40AF' }]}>
                                    {t.type === 'medication' ? '💊' : ''} {t.name}
                                </Text>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                Generated by Injury Tracker AI • Not a medical diagnosis • Consult a professional
            </Text>
        </Page>
    </Document>
);
