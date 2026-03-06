/**
 * File Type: Business Logic Hook
 * Input Type: None
 * Output Type:
 * {
 *   offerItems: { candidate: string, role: string, package: string, status: string }[],
 *   summaryCards: { label: string, value: string, iconKey: "review" | "budget" | "approved" }[]
 * }
 */
import { useMemo } from "react";

const OFFER_ITEMS = [
  { candidate: "Sneha Rao", role: "Frontend Developer", package: "6.5 LPA", status: "Pending Approval" },
  { candidate: "Rahul Arora", role: "Data Analyst", package: "7.2 LPA", status: "Ready to Release" },
  { candidate: "Nisha Das", role: "QA Engineer", package: "5.8 LPA", status: "Compensation Review" },
];

export default function useOfferApprovals() {
  const summaryCards = useMemo(
    () => [
      { label: "Offers In Review", value: "12", iconKey: "review" },
      { label: "Budget Reserved", value: "48.6 LPA", iconKey: "budget" },
      { label: "Approved This Week", value: "7", iconKey: "approved" },
    ],
    [],
  );

  return {
    offerItems: OFFER_ITEMS,
    summaryCards,
  };
}
