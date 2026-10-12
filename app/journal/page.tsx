import type { Metadata } from "next";
import Journal from "@/components/journal/Journal";

export const metadata: Metadata = { title: "Journal · Puebla ’26" };

export default function JournalPage() {
  return <Journal />;
}
