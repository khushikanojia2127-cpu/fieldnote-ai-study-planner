import { BookOpen, ChevronRight, Leaf, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  Card,
  EmptyState,
  Modal,
  PageTitle,
  ProgressBar,
  Tag,
} from "../../components/UI";
import { newId, palette, type AppData, type Subject } from "../../types";

export function SubjectsView({
  data,
  onUpdate,
}: {
  data: AppData;
  onUpdate: (transform: (state: AppData) => AppData) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [topicsText, setTopicsText] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const subject = data.subjects.find((item) => item.id === selected);

  const addSubject = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    const item: Subject = {
      id: newId(),
      name: cleanName,
      code: code.trim() || "MY SUBJECT",
      topics: topicsText
        .split(/[,\n]/)
        .map((topic) => topic.trim())
        .filter(Boolean),
      color: palette[data.subjects.length % palette.length],
    };
    onUpdate((state) => ({ ...state, subjects: [...state.subjects, item] }));
    setShowForm(false);
    setName("");
    setCode("");
    setTopicsText("");
  };
  const updateSubject = (patch: Partial<Subject>) =>
    subject &&
    onUpdate((state) => ({
      ...state,
      subjects: state.subjects.map((item) =>
        item.id === subject.id ? { ...item, ...patch } : item,
      ),
    }));
  const addTopic = (event: React.FormEvent) => {
    event.preventDefault();
    const topic = newTopic.trim();
    if (!subject || !topic || subject.topics.includes(topic)) return;
    updateSubject({ topics: [...subject.topics, topic] });
    setNewTopic("");
  };
  const removeTopic = (topic: string) =>
    updateSubject({
      topics: subject?.topics.filter((item) => item !== topic) || [],
    });
  const removeSubject = (id: string) => {
    if (
      !window.confirm(
        "Remove this subject and its associated tasks, sessions, notes and quizzes from this device?",
      )
    )
      return;
    onUpdate((state) => ({
      ...state,
      subjects: state.subjects.filter((item) => item.id !== id),
      tasks: state.tasks.filter((task) => task.subjectId !== id),
      sessions: state.sessions.filter((session) => session.subjectId !== id),
      notes: state.notes.filter((note) => note.subjectId !== id),
      quizzes: state.quizzes.filter((quiz) => quiz.subjectId !== id),
      sampleWorkspace:
        state.sampleWorkspace && id !== "sample-python-foundations",
    }));
    setSelected(null);
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="YOUR COURSE LIBRARY"
        title="Subjects & topics"
        description="Keep the material you choose to study in one tidy place."
        action={
          <button
            className="button button-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} /> Add a subject
          </button>
        }
      />
      {data.sampleWorkspace && (
        <div className="inline-note">
          <Leaf size={16} />
          <span>
            The Python starter is editable sample data from the project
            report—not a course syllabus. Your subjects stay on this device.
          </span>
        </div>
      )}
      {data.subjects.length ? (
        <div className="subjects-layout">
          <div className="subject-cards">
            {data.subjects.map((item) => {
              const related = data.tasks.filter(
                (task) => task.subjectId === item.id,
              );
              const completed = related.filter((task) => task.completed).length;
              const progress = related.length
                ? Math.round((completed / related.length) * 100)
                : 0;
              return (
                <Card
                  className={`subject-card ${selected === item.id ? "subject-card-selected" : ""}`}
                  key={item.id}
                >
                  <div className="subject-card-top">
                    <div
                      className="subject-specimen"
                      style={
                        { "--subject-color": item.color } as React.CSSProperties
                      }
                    >
                      <BookOpen size={21} />
                    </div>
                    <button
                      className="icon-button subtle"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeSubject(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="eyebrow">{item.code || "MY SUBJECT"}</p>
                  <h2>{item.name}</h2>
                  <p className="subject-topic-count">
                    {item.topics.length}{" "}
                    {item.topics.length === 1 ? "topic" : "topics"} ·{" "}
                    {related.length} tasks
                  </p>
                  <div className="subject-card-progress">
                    <ProgressBar value={progress} color={item.color} />
                    <span>task progress</span>
                  </div>
                  <div className="subject-chip-row">
                    {item.topics.slice(0, 3).map((topic) => (
                      <Tag key={topic}>{topic}</Tag>
                    ))}
                    {item.topics.length > 3 && (
                      <Tag tone="paper">+{item.topics.length - 3}</Tag>
                    )}
                  </div>
                  <button
                    className="subject-open"
                    onClick={() => setSelected(item.id)}
                  >
                    Manage subject & topics <ChevronRight size={15} />
                  </button>
                </Card>
              );
            })}
          </div>
          <Card className="topic-panel">
            {subject ? (
              <>
                <div className="topic-panel-head">
                  <div>
                    <p className="eyebrow">SUBJECT INDEX</p>
                    <h2>{subject.name}</h2>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Close subject details"
                    onClick={() => setSelected(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="muted-copy">
                  Edit this label and the topics you want plans and quizzes to
                  use.
                </p>
                <div className="subject-edit-fields">
                  <label>
                    Subject name
                    <input
                      maxLength={120}
                      value={subject.name}
                      onChange={(event) =>
                        updateSubject({ name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Short label
                    <input
                      maxLength={40}
                      value={subject.code}
                      onChange={(event) =>
                        updateSubject({ code: event.target.value })
                      }
                    />
                  </label>
                </div>
                <form className="add-topic-form" onSubmit={addTopic}>
                  <input
                    aria-label="New topic"
                    value={newTopic}
                    onChange={(event) => setNewTopic(event.target.value)}
                    placeholder="Add a topic…"
                  />
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={!newTopic.trim()}
                  >
                    <Plus size={15} /> Add
                  </button>
                </form>
                <div className="topic-list">
                  {subject.topics.length ? (
                    subject.topics.map((topic, index) => (
                      <div className="topic-row" key={topic}>
                        <span className="topic-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{topic}</span>
                        <button
                          className="icon-button subtle"
                          aria-label={`Remove topic ${topic}`}
                          onClick={() => removeTopic(topic)}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="small-empty">
                      No topics yet. Add one when you're ready.
                    </p>
                  )}
                </div>
                <div className="topic-grounding">
                  <Leaf size={15} />
                  <span>
                    When you request a study plan or quiz, this subject context
                    is sent to Manus AI.
                  </span>
                </div>
              </>
            ) : (
              <div className="topic-placeholder">
                <div className="leaf-ring">
                  <Leaf size={21} />
                </div>
                <h3>Choose a specimen</h3>
                <p>Open a subject to edit its details and topic list.</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Your shelf is ready"
            message="Add a subject and its topics. Study plans and quizzes will use only what you put here."
            action={
              <button
                className="button button-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={15} /> Add a subject
              </button>
            }
          />
        </Card>
      )}
      {showForm && (
        <Modal
          title="Add a subject"
          description="Start with a course you are studying. You can refine topics any time."
          onClose={() => setShowForm(false)}
        >
          <form className="form-stack" onSubmit={addSubject}>
            <label>
              Subject name
              <input
                autoFocus
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Database systems"
              />
            </label>
            <label>
              Short label <span className="optional-label">Optional</span>
              <input
                maxLength={40}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. DBMS"
              />
            </label>
            <label>
              Topics{" "}
              <span className="optional-label">
                Separate with commas or new lines
              </span>
              <textarea
                value={topicsText}
                onChange={(event) => setTopicsText(event.target.value)}
                rows={3}
                placeholder="e.g. Relational model, SQL, Normalization"
              />
            </label>
            <p className="form-hint">
              <Leaf size={13} /> Your own topics make better, more grounded
              study plans.
            </p>
            <div className="modal-actions">
              <button
                className="button button-ghost"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Add subject
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
