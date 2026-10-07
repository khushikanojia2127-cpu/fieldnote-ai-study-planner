import {
  FileText,
  Leaf,
  NotebookPen,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { summarizeNotes } from "../../lib/ai";
import {
  Card,
  EmptyState,
  LoadingButton,
  PageTitle,
  Tag,
} from "../../components/UI";
import { newId, type AppData, type StudyNote } from "../../types";

export function NotesView({
  data,
  onUpdate,
}: {
  data: AppData;
  onUpdate: (transform: (state: AppData) => AppData) => void;
}) {
  const [selectedId, setSelectedId] = useState(data.notes[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const note = data.notes.find((n) => n.id === selectedId);
  useEffect(() => {
    if (!data.notes.some((n) => n.id === selectedId))
      setSelectedId(data.notes[0]?.id || "");
  }, [data.notes, selectedId]);
  const createNote = () => {
    const newNote: StudyNote = {
      id: newId(),
      title: "Untitled note",
      subjectId: data.subjects[0]?.id || "",
      content: "",
      summary: "",
      updatedAt: new Date().toISOString(),
    };
    onUpdate((state) => ({ ...state, notes: [newNote, ...state.notes] }));
    setSelectedId(newNote.id);
  };
  const updateNote = (patch: Partial<StudyNote>) =>
    note &&
    onUpdate((state) => ({
      ...state,
      notes: state.notes.map((item) =>
        item.id === note.id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
  const makeSummary = async () => {
    if (!note || note.content.trim().length < 20) {
      setError(
        "Add at least a few lines of your own notes before asking for a summary.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const summary = await summarizeNotes(note.title, note.content);
      onUpdate((state) => ({
        ...state,
        notes: state.notes.map((item) =>
          item.id === note.id
            ? { ...item, summary, updatedAt: new Date().toISOString() }
            : item,
        ),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not summarize these notes. Your original text is still here.",
      );
    } finally {
      setBusy(false);
    }
  };
  const removeNote = (id: string) => {
    if (!window.confirm("Delete this note from this device?")) return;
    onUpdate((state) => ({
      ...state,
      notes: state.notes.filter((item) => item.id !== id),
    }));
  };
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="YOUR OWN WORDS, WELL KEPT"
        title="Notes & summaries"
        description="Bring your notes together, then make a lighter version for revision."
        action={
          <button className="button button-primary" onClick={createNote}>
            <Plus size={16} /> New note
          </button>
        }
      />
      <div className="notes-layout">
        <Card className="notes-index">
          <div className="notes-index-heading">
            <span className="eyebrow">NOTEBOOK</span>
            <span>{data.notes.length.toString().padStart(2, "0")}</span>
          </div>
          {data.notes.length ? (
            <div className="note-index-list">
              {data.notes.map((item) => {
                const subject = data.subjects.find(
                  (s) => s.id === item.subjectId,
                );
                return (
                  <button
                    key={item.id}
                    className={`note-index-item ${selectedId === item.id ? "note-selected" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="note-index-icon">
                      <FileText size={16} />
                    </span>
                    <span className="note-index-copy">
                      <strong>{item.title || "Untitled note"}</strong>
                      <small>
                        {subject?.name || "No subject"} ·{" "}
                        {
                          item.content.trim().split(/\s+/).filter(Boolean)
                            .length
                        }{" "}
                        words
                      </small>
                    </span>
                    <span className="note-index-dot" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="note-index-empty">
              <NotebookPen size={20} />
              <p>Your notebook begins with what you write.</p>
            </div>
          )}
          <button className="new-note-link" onClick={createNote}>
            <Plus size={15} /> Create a note
          </button>
          <div className="local-notes-note">
            <Leaf size={14} /> Saved in this browser; note text is sent to Manus
            AI only when you ask for a summary.
          </div>
        </Card>
        {note ? (
          <div className="note-workspace">
            <Card className="note-editor-card">
              <div className="note-editor-meta">
                <Tag tone="paper">
                  <Leaf size={12} /> SOURCE MATERIAL
                </Tag>
                <span>Saved on this device</span>
                <button
                  className="icon-button subtle"
                  aria-label="Delete note"
                  onClick={() => removeNote(note.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                className="note-title-input"
                aria-label="Note title"
                value={note.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Give your note a name…"
              />
              <div className="note-subject-row">
                <span>FOR</span>
                <select
                  value={note.subjectId}
                  onChange={(e) => updateNote({ subjectId: e.target.value })}
                >
                  <option value="">No subject</option>
                  {data.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="note-content-input"
                aria-label="Your source notes"
                value={note.content}
                onChange={(e) =>
                  updateNote({ content: e.target.value, summary: "" })
                }
                placeholder="Write or paste your own course notes here…\n\nThe summary tool will only use what you add to this note."
              />
              <div className="note-editor-foot">
                <span>
                  {note.content.trim().split(/\s+/).filter(Boolean).length}{" "}
                  words
                </span>
                <span>
                  <Save size={13} /> Autosaved locally
                </span>
              </div>
            </Card>
            <Card className="summary-card">
              <div className="summary-head">
                <div className="summary-sparkle">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="eyebrow">A SMALLER VERSION</p>
                  <h2>Revision summary</h2>
                </div>
                <Tag tone="sage">AI-ASSISTED</Tag>
              </div>
              {note.summary ? (
                <div className="summary-result">
                  <p className="ai-content-label">
                    <Sparkles size={13} /> Generated from “
                    {note.title || "your note"}”
                  </p>
                  <div className="summary-text">{note.summary}</div>
                  <div className="verify-line">
                    <Leaf size={13} /> Check key details against your original
                    material.
                  </div>
                </div>
              ) : (
                <div className="summary-empty">
                  <div className="summary-leaf-ring">
                    <Leaf size={20} />
                  </div>
                  <h3>Only your material, made lighter.</h3>
                  <p>
                    Add at least 20 characters of your notes, then make a short
                    revision guide.
                  </p>
                </div>
              )}
              {error && <div className="inline-error">{error}</div>}
              <LoadingButton
                className="button button-primary"
                onClick={() => void makeSummary()}
                busy={busy}
                disabled={!note.content.trim()}
              >
                <Sparkles size={15} />{" "}
                {note.summary ? "Refresh summary" : "Create a summary"}
              </LoadingButton>
              <span className="summary-grounding">
                <Leaf size={12} /> Generated only from this note. Always verify.
              </span>
            </Card>
          </div>
        ) : (
          <Card className="note-first-state">
            <EmptyState
              title="Your notebook is ready"
              message="Write a few lines in your own words, then ask for a source-based revision summary."
              action={
                <button className="button button-primary" onClick={createNote}>
                  <Plus size={15} /> Create your first note
                </button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
