import { FaUserCircle, FaPen, FaClock, FaCheckCircle } from "react-icons/fa";

export default function ProfileSummaryCard({ user, formatMemberSince, summaryLoading, summaryCounts }) {
  return (
    <aside className="profile-card profile-summary">
      <div className="profile-avatar">
        <FaUserCircle />
      </div>

      <h2>{user?.pseudo || "Inconnu"}</h2>
      <p className="profile-member-since">
        {formatMemberSince(user?.date_inscription)}
      </p>

      <ul className="profile-stats">
        <li>
          <span><FaPen /> Annonces actives</span>
          <strong>{summaryLoading ? "..." : summaryCounts.active}</strong>
        </li>
        <li>
          <span><FaCheckCircle /> Annonces vendues</span>
          <strong>{summaryLoading ? "..." : summaryCounts.vendues}</strong>
        </li>
        <li>
          <span><FaClock /> Annonces brouillon</span>
          <strong>{summaryLoading ? "..." : summaryCounts.brouillon}</strong>
        </li>
      </ul>
    </aside>
  );
}
