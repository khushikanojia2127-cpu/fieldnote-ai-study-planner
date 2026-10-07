import {
  ChartNoAxesCombined,
  CircleHelp,
  LayoutDashboard,
  LibraryBig,
  ListTodo,
  MessagesSquare,
  NotebookPen,
  CalendarClock,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ViewKey } from "../types";

const navItems: Array<{ key: ViewKey; label: string; icon: ReactNode }> = [
  { key: "today", label: "Today", icon: <LayoutDashboard size={18} /> },
  { key: "subjects", label: "Subjects", icon: <LibraryBig size={18} /> },
  { key: "tasks", label: "Tasks & deadlines", icon: <ListTodo size={18} /> },
  { key: "planner", label: "Study plan", icon: <CalendarClock size={18} /> },
  {
    key: "assistant",
    label: "AI study companion",
    icon: <MessagesSquare size={18} />,
  },
  { key: "notes", label: "Notes & summaries", icon: <NotebookPen size={18} /> },
  { key: "quizzes", label: "Quizzes", icon: <CircleHelp size={18} /> },
  {
    key: "progress",
    label: "Progress",
    icon: <ChartNoAxesCombined size={18} />,
  },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-compact" : ""}`}>
      <span className="brand-glyph" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M8 22.6C8 14.7 13.6 8.4 24.1 7C23.8 17.8 18.6 23.8 10.8 23.8C9.7 23.8 8.8 23.4 8 22.6Z"
            fill="currentColor"
          />
          <path
            d="M8.7 24.6C13 20.1 17.3 16.1 23 11.3M13.7 19.6L12.9 15.2M17.8 15.8L18.1 11.9"
            stroke="#F6F5ED"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M7.2 27H25"
            stroke="#C6D765"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="brand-text">
          fieldnote<span className="brand-dot">.</span>
          <small>STUDY, GROW, REPEAT</small>
        </span>
      )}
    </div>
  );
}

export function Sidebar({
  view,
  onChange,
  open,
  onClose,
}: {
  view: ViewKey;
  onChange: (key: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <button
        className={`mobile-scrim ${open ? "visible" : ""}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <BrandMark />
          <button
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="side-label">YOUR WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onChange(item.key);
                onClose();
              }}
              className={`nav-item ${view === item.key ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {view === item.key && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="season-card">
            <span className="season-leaf" aria-hidden="true">
              ❧
            </span>
            <div>
              <strong>Keep it growing</strong>
              <p>Small sessions add up.</p>
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">F</div>
            <div className="profile-copy">
              <strong>My study desk</strong>
              <span>Private on this device</span>
            </div>
            <span className="profile-status" />
          </div>
        </div>
      </aside>
    </>
  );
}
