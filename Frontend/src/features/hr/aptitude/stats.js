/**
 * File Type: Feature Stat Helpers
 * Input Type: Counts + color palette
 * Output Type: StatsCard data array
 */
import { Briefcase, CheckCircle2, MapPin, Users } from "lucide-react";

export const buildAptitudeStats = ({ drivesCount, jobsCount, candidatesCount, trackedCount, colors }) => [
  {
    title: "Drives",
    count: drivesCount,
    icon: MapPin,
    bgColor: colors.rainShadow,
    lightBg: "#E8F9F0",
  },
  {
    title: "Jobs",
    count: jobsCount,
    icon: Briefcase,
    bgColor: colors.softFlow,
    lightBg: "#E6F9F5",
  },
  {
    title: "Candidates",
    count: candidatesCount,
    icon: Users,
    bgColor: colors.marigoldFlame,
    lightBg: "#FFF9E6",
  },
  {
    title: "Tracked Aptitude IDs",
    count: trackedCount,
    icon: CheckCircle2,
    bgColor: colors.mossRock,
    lightBg: "#E8F9E8",
  },
];
