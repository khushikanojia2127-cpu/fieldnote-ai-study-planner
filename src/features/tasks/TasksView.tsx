import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Filter,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card, EmptyState, Modal, PageTitle, Tag } from "../../components/UI";
import { dateKey } from "../../lib/storage";
import {
  newId,
  type AppData,
  type StudyTask,
  type TaskKind,
  type TaskPriority,
} from "../../types";

const blankTask = (subjectId: string) => ({
  title: "",
  subjectId,
  description: "",
  dueDate: dateKey(3),
  priority: "medium" as TaskPriority,
  kind: "assignment" as TaskKind,
  estimatedMinutes: 45,
});

export function TasksView({
  data,
  onUpdate,
  onCreateSubject,
}: {
  data: AppData;
  onUpdate: (transform: (state: AppData) => AppData) => void;
  onCreateSubject: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "open" | "upcoming" | "completed"
  >("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(() =>
    blankTask(data.subjects[0]?.id || ""),
  );
  const today = dateKey();
  const filtered = useMemo(
    () =>
      data.tasks
        .filter(
          (task) =>
            (filter === "all" ||
              (filter === "completed"
                ? task.completed
                : filter === "upcoming"
                  ? !task.completed && task.dueDate >= today
                  : !task.completed)) &&
            `${task.title} ${task.description}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          a.completed === b.completed
            ? a.dueDate.localeCompare(b.dueDate)
            : Number(a.completed) - Number(b.completed),
        ),
    [data.tasks, filter, search, today],
  );
  const toggle = (id: string) =>
    onUpdate((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: task.completed
                ? undefined
                : new Date().toISOString(),
            }
          : task,
      ),
    }));
  const openNewTask = () => {
    setEditingId(null);
    setDraft(blankTask(data.subjects[0]?.id || ""));
    setShowForm(true);
  };
  const openEditTask = (task: StudyTask) => {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      subjectId: task.subjectId,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      kind: task.kind,
      estimatedMinutes: task.estimatedMinutes,
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };
  const saveTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.subjectId) return;
    if (editingId) {
      onUpdate((state) => ({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === editingId
            ? {
                ...task,
                ...draft,
                title: draft.title.trim(),
                description: draft.description.trim(),
                estimatedMinutes: Number(draft.estimatedMinutes),
              }
            : task,
        ),
      }));
    } else {
      const task: StudyTask = {
        ...draft,
        id: newId(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        completed: false,
        estimatedMinutes: Number(draft.estimatedMinutes),
      };
      onUpdate((state) => ({ ...state, tasks: [...state.tasks, task] }));
    }
    closeForm();
  };
  const removeTask = (id: string) =>
    onUpdate((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  const dueLabel = (date: string) => {
    const days = Math.round(
      (new Date(`${date}T00:00:00`).getTime() -
        new Date(`${dateKey()}T00:00:00`).getTime()) /
        86400000,
    );
    return days < 0
      ? `${Math.abs(days)} days ago`
      : days === 0
        ? "Today"
        : days === 1
          ? "Tomorrow"
          : new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(new Date(`${date}T12:00:00`));
  };
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="YOUR STUDY TO-DOS"
        title="Tasks & deadlines"
        description="Assignments, projects, and the small steps in between."
        action={
          <button
            className="button button-primary"
            onClick={openNewTask}
            disabled={!data.subjects.length}
          >
            <Plus size={16} /> Add a task
          </button>
        }
      />
      <Card className="task-board">
        <div className="task-toolbar">
          <div
            className="task-filter-tabs"
            role="tablist"
            aria-label="Filter tasks"
          >
            {(
              [
                ["all", "All tasks"],
                ["open", "To do"],
                ["upcoming", "Upcoming"],
                ["completed", "Completed"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? "tab-active" : ""}
                onClick={() => setFilter(key)}
              >
                {label}
                <span>
                  {
                    data.tasks.filter(
                      (task) =>
                        key === "all" ||
                        (key === "completed"
                          ? task.completed
                          : key === "upcoming"
                            ? !task.completed && task.dueDate >= today
                            : !task.completed),
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          <label className="task-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a task…"
              aria-label="Search tasks"
            />
          </label>
        </div>
        {filtered.length ? (
          <div className="task-table">
            {filtered.map((task) => {
              const subject = data.subjects.find(
                (item) => item.id === task.subjectId,
              );
              const days = Math.round(
                (new Date(`${task.dueDate}T00:00:00`).getTime() -
                  new Date(`${dateKey()}T00:00:00`).getTime()) /
                  86400000,
              );
              return (
                <div
                  className={`task-row ${task.completed ? "task-done" : ""}`}
                  key={task.id}
                >
                  <button
                    className={`task-complete ${task.completed ? "is-complete" : ""}`}
                    aria-label={
                      task.completed
                        ? `Reopen ${task.title}`
                        : `Complete ${task.title}`
                    }
                    onClick={() => toggle(task.id)}
                  >
                    {task.completed ? (
                      <Check size={15} />
                    ) : (
                      <Circle size={19} />
                    )}
                  </button>
                  <div className="task-main">
                    <strong>{task.title}</strong>
                    <span>{task.description || task.kind}</span>
                  </div>
                  <span className="task-subject-chip">
                    <i style={{ background: subject?.color || "#719677" }} />
                    {subject?.name || "Unassigned"}
                  </span>
                  <span className="task-due">
                    <CalendarDays size={14} />
                    <span
                      className={days < 0 && !task.completed ? "overdue" : ""}
                    >
                      {dueLabel(task.dueDate)}
                    </span>
                  </span>
                  <Tag
                    tone={
                      task.priority === "high"
                        ? "rose"
                        : task.priority === "medium"
                          ? "amber"
                          : "sage"
                    }
                  >
                    {task.priority}
                  </Tag>
                  <span className="task-effort">
                    <Clock3 size={14} /> {task.estimatedMinutes}m
                  </span>
                  <div className="task-actions">
                    <button
                      aria-label={`Edit ${task.title}`}
                      title="Edit task"
                      onClick={() => openEditTask(task)}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="task-remove"
                      aria-label={`Delete ${task.title}`}
                      title="Delete task"
                      onClick={() => removeTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={
              search
                ? "No matches yet"
                : filter === "completed"
                  ? "A clean slate"
                  : filter === "upcoming"
                    ? "No upcoming deadlines"
                    : "Nothing on your list"
            }
            message={
              search
                ? "Try another word or clear the search."
                : filter === "upcoming"
                  ? "Tasks due today or later will appear here."
                  : "Add a task with a subject and deadline; it will appear here and in your plan."
            }
            action={
              data.subjects.length ? (
                <button
                  className="button button-secondary"
                  onClick={openNewTask}
                >
                  <Plus size={15} /> Add task
                </button>
              ) : (
                <button
                  className="button button-secondary"
                  onClick={onCreateSubject}
                >
                  Add a subject first
                </button>
              )
            }
          />
        )}
      </Card>
      <div className="tasks-footnote">
        <span>
          <Filter size={14} /> Deadlines help shape your study plan.
        </span>
        <span>
          <SlidersHorizontal size={14} /> Edit any priority or time estimate
          whenever you need.
        </span>
      </div>
      {showForm && (
        <Modal
          title={editingId ? "Edit academic task" : "Add an academic task"}
          description="Capture the deliverable and when you'd like it done."
          onClose={closeForm}
        >
          <form className="form-stack" onSubmit={saveTask}>
            <label>
              Task title
              <input
                autoFocus
                required
                maxLength={200}
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                placeholder="e.g. Finish the normalization worksheet"
              />
            </label>
            <label>
              Subject
              <select
                required
                value={draft.subjectId}
                onChange={(event) =>
                  setDraft({ ...draft, subjectId: event.target.value })
                }
              >
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description <span className="optional-label">Optional</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                placeholder="A note to your future self…"
              />
            </label>
            <div className="form-row">
              <label>
                Due date
                <input
                  required
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) =>
                    setDraft({ ...draft, dueDate: event.target.value })
                  }
                />
              </label>
              <label>
                Priority
                <select
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      priority: event.target.value as TaskPriority,
                    })
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Task type
                <select
                  value={draft.kind}
                  onChange={(event) =>
                    setDraft({ ...draft, kind: event.target.value as TaskKind })
                  }
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="revision">Revision</option>
                  <option value="presentation">Presentation</option>
                </select>
              </label>
              <label>
                Estimated effort (minutes)
                <input
                  type="number"
                  min="10"
                  max="2000"
                  step="5"
                  value={draft.estimatedMinutes}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      estimatedMinutes: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="button button-ghost"
                type="button"
                onClick={closeForm}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                {editingId ? "Save changes" : "Save task"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
