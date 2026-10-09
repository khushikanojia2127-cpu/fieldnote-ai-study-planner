import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleHelp,
  LibraryBig,
  ListTodo,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { ViewKey } from "../types";

type TourStep = {
  label: string;
  title: string;
  description: string;
  bullets: string[];
  destination: ViewKey;
  actionLabel: string;
  accent: "navy" | "sky" | "coral" | "cream";
  icon: ReactNode;
};

const steps: TourStep[] = [
  {
    label: "Set up",
    title: "Start with your subjects.",
    description:
      "Add the courses and topics you are actually studying. Fieldnote uses your input instead of guessing your syllabus.",
    bullets: [
      "Open Subjects to add a course and its topics.",
      "The Python examples are editable demo data, not your course syllabus.",
    ],
    destination: "subjects",
    actionLabel: "Open subjects",
    accent: "navy",
    icon: <LibraryBig size={28} strokeWidth={1.6} />,
  },
  {
    label: "Capture",
    title: "Keep deadlines in view.",
    description:
      "Add assignments, exams, projects and revision tasks so your upcoming work has a clear place.",
    bullets: [
      "Set a due date, priority and estimated effort for each task.",
      "Your dashboard brings the next deadlines and study blocks together.",
    ],
    destination: "tasks",
    actionLabel: "Open tasks",
    accent: "sky",
    icon: <ListTodo size={28} strokeWidth={1.6} />,
  },
  {
    label: "Plan",
    title: "Draft a study rhythm that fits.",
    description:
      "Choose your available study time and preferred block length. Ask AI to draft sessions around your subjects and deadlines.",
    bullets: [
      "Review the draft before relying on it; generated plans stay editable.",
      "Move, reschedule or complete a session whenever your week changes.",
    ],
    destination: "planner",
    actionLabel: "Open study plan",
    accent: "coral",
    icon: <CalendarClock size={28} strokeWidth={1.6} />,
  },
  {
    label: "Learn & reflect",
    title: "Practice, then notice your progress.",
    description:
      "Use notes, summaries, quizzes and the AI study companion to learn actively, then mark sessions complete to see your study rhythm.",
    bullets: [
      "AI summaries and quizzes use the notes or topics you choose.",
      "Check AI suggestions against your class materials and teacher guidance.",
    ],
    destination: "progress",
    actionLabel: "Open progress",
    accent: "cream",
    icon: <Sparkles size={28} strokeWidth={1.6} />,
  },
];

export function IntroTour({
  open,
  onDismiss,
  onNavigate,
}: {
  open: boolean;
  onDismiss: () => void;
  onNavigate: (key: ViewKey) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const step = steps[activeStep];
  const finalStep = activeStep === steps.length - 1;

  useEffect(() => {
    if (open) setActiveStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus());
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, onDismiss]);

  const keepFocusInside = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled])",
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  const openSection = () => {
    onNavigate(step.destination);
    onDismiss();
  };

  return (
    <div className="intro-backdrop">
      <section
        ref={dialogRef}
        className="intro-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        aria-describedby="intro-description"
        onKeyDown={keepFocusInside}
      >
        <header className="intro-header">
          <div className="intro-brand-row">
            <span className="intro-brand-leaf" aria-hidden="true">
              <CircleHelp size={17} />
            </span>
            <div>
              <p className="intro-kicker">FIELDNOTE · QUICK FIELD GUIDE</p>
              <p className="intro-brand-name">A few steps to get started</p>
            </div>
          </div>
          <button
            className="icon-button intro-close"
            type="button"
            onClick={onDismiss}
            aria-label="Close the Fieldnote guide"
            title="Close guide"
          >
            <X size={18} />
          </button>
        </header>

        <div className="intro-main" key={activeStep}>
          <aside
            className={`intro-specimen intro-specimen-${step.accent}`}
            aria-hidden="true"
          >
            <span className="intro-specimen-label">
              FIELD NOTE {String(activeStep + 1).padStart(2, "0")}
            </span>
            <div className="intro-specimen-icon">{step.icon}</div>
            <span className="intro-specimen-caption">{step.label}</span>
            <div className="intro-palette-stripe">
              <span />
              <span />
              <span />
              <span />
            </div>
          </aside>

          <div className="intro-copy">
            <div className="intro-step-meta">
              <span>
                {String(activeStep + 1).padStart(2, "0")} /{" "}
                {String(steps.length).padStart(2, "0")}
              </span>
              <span className="intro-meta-line" />
              <span>{step.label}</span>
            </div>
            <h2 id="intro-title" ref={titleRef} tabIndex={-1}>
              {step.title}
            </h2>
            <p id="intro-description" className="intro-description">
              {step.description}
            </p>
            <ul className="intro-bullets">
              {step.bullets.map((bullet) => (
                <li key={bullet}>
                  <span className="intro-check" aria-hidden="true">
                    <Check size={13} strokeWidth={2.2} />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <button
              className="intro-section-link"
              type="button"
              onClick={openSection}
            >
              {step.actionLabel}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="intro-privacy">
          <span className="intro-privacy-icon" aria-hidden="true">
            <LockKeyhole size={15} />
          </span>
          <p>
            <strong>Your workspace stays in this browser.</strong> Text is sent
            to Manus AI only when you request an AI action. Check generated
            ideas against your course materials.
          </p>
        </div>

        <footer className="intro-footer">
          <div className="intro-footer-left">
            {activeStep === 0 ? (
              <button
                className="intro-text-button"
                type="button"
                onClick={onDismiss}
              >
                Skip guide
              </button>
            ) : (
              <button
                className="intro-back-button"
                type="button"
                onClick={() => setActiveStep((index) => Math.max(0, index - 1))}
              >
                <ArrowLeft size={15} />
                Back
              </button>
            )}
          </div>

          <div className="intro-progress" aria-label="Guide progress">
            {steps.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={`intro-progress-dot ${index === activeStep ? "active" : ""}`}
                aria-label={`Go to step ${index + 1}: ${item.label}`}
                aria-pressed={index === activeStep}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>

          <div className="intro-footer-right">
            <button
              className="intro-next-button"
              type="button"
              onClick={() =>
                finalStep
                  ? onDismiss()
                  : setActiveStep((index) =>
                      Math.min(steps.length - 1, index + 1),
                    )
              }
            >
              {finalStep ? "Finish" : "Next"}
              {finalStep ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
