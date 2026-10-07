import type { ReactNode } from "react";
import { X } from "lucide-react";

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title-row">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-title-action">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Tag({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "amber" | "rose" | "ink" | "paper";
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function ProgressBar({
  value,
  color = "#235b45",
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-wrap" aria-label={label || `${bounded}% complete`}>
      <div className="progress-track">
        <span
          className="progress-fill"
          style={{ width: `${bounded}%`, backgroundColor: color }}
        />
      </div>
      <span className="progress-value">{Math.round(bounded)}%</span>
    </div>
  );
}

export function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-leaf" aria-hidden="true">
        ✳
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function LoadingButton({
  busy,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      className={`${className} ${busy ? "is-busy" : ""}`}
      disabled={busy || props.disabled}
    >
      {busy && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
