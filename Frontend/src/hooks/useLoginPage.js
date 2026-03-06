/**
 * File Type: Business Logic Hook
 * Input Type: { navigate: (path: string) => void }
 * Output Type:
 * {
 *   roleTabs: string[],
 *   activeTab: string,
 *   setActiveTab: Dispatch<SetStateAction<string>>,
 *   email: string,
 *   setEmail: Dispatch<SetStateAction<string>>,
 *   password: string,
 *   setPassword: Dispatch<SetStateAction<string>>,
 *   handleSubmit: (event: FormEvent<HTMLFormElement>) => void
 * }
 */
import { useMemo, useState } from "react";

import tempAuth from "../data/tempAuth.json";

const ROLE_TABS = ["Candidate", "Panelist", "HR Admin", "College"];

const safeLower = (value) => String(value || "").trim().toLowerCase();

export default function useLoginPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("Candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hrAdmin = useMemo(() => tempAuth?.hrAdmin || { email: "", password: "" }, []);
  const candidateAuth = useMemo(() => tempAuth?.candidate || { email: "", password: "" }, []);

  const handleCandidateLogin = () => {
    const matchesEmail = safeLower(email) === safeLower(candidateAuth.email);
    const matchesPassword = password === String(candidateAuth.password || "");

    if (!matchesEmail || !matchesPassword) {
      alert("Invalid candidate credentials.");
      return;
    }

    localStorage.setItem("candidate_auth", "true");
    localStorage.setItem("candidate_name", "Candidate");
    localStorage.setItem("candidate_email", String(candidateAuth.email || ""));
    localStorage.removeItem("candidate_id");
    localStorage.removeItem("hr_auth");
    localStorage.removeItem("hr_email");
    navigate("/candidate-dashboard");
  };

  const handleHrAdminLogin = () => {
    const isValidHrLogin = safeLower(email) === safeLower(hrAdmin.email) && password === hrAdmin.password;
    if (!isValidHrLogin) {
      alert("Invalid HR Admin credentials.");
      return;
    }

    localStorage.setItem("hr_auth", "true");
    localStorage.setItem("hr_email", hrAdmin.email);
    localStorage.removeItem("candidate_auth");
    localStorage.removeItem("candidate_name");
    localStorage.removeItem("candidate_email");
    localStorage.removeItem("candidate_id");
    navigate("/HR/dashboard");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (activeTab === "Candidate") {
      handleCandidateLogin();
      return;
    }

    if (activeTab === "HR Admin") {
      handleHrAdminLogin();
      return;
    }

    console.log(`Logging in as ${activeTab}:`, { email, password });
  };

  return {
    roleTabs: ROLE_TABS,
    activeTab,
    setActiveTab,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
}
