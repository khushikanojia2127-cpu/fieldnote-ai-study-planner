import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Leaf,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { generateQuiz } from "../../lib/ai";
import {
  Card,
  EmptyState,
  LoadingButton,
  PageTitle,
  Tag,
} from "../../components/UI";
import { newId, type AppData, type StudyQuiz } from "../../types";

export function QuizzesView({
  data,
  onUpdate,
}: {
  data: AppData;
  onUpdate: (transform: (state: AppData) => AppData) => void;
}) {
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || "");
  const [topic, setTopic] = useState(data.subjects[0]?.topics[0] || "");
  const [noteId, setNoteId] = useState("");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeQuizId, setActiveQuizId] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const activeQuiz = data.quizzes.find((q) => q.id === activeQuizId);
  const selectedSubject = data.subjects.find((s) => s.id === subjectId);
  const selectedNote = data.notes.find((n) => n.id === noteId);
  const changeSubject = (id: string) => {
    setSubjectId(id);
    setTopic(data.subjects.find((s) => s.id === id)?.topics[0] || "");
    setNoteId("");
  };
  const makeQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const generated = await generateQuiz({
        subject: selectedSubject?.name || "",
        topic,
        notes: selectedNote?.content || "",
        count,
      });
      const quiz: StudyQuiz = {
        id: newId(),
        title: generated.title,
        subjectId,
        topic,
        questions: generated.questions,
        createdAt: new Date().toISOString(),
      };
      onUpdate((state) => ({ ...state, quizzes: [quiz, ...state.quizzes] }));
      setActiveQuizId(quiz.id);
      setAnswers(Array(quiz.questions.length).fill(-1));
      setSubmitted(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create this quiz. Your topic and notes are unchanged.",
      );
    } finally {
      setBusy(false);
    }
  };
  const startQuiz = (id: string) => {
    const quiz = data.quizzes.find((q) => q.id === id);
    if (!quiz) return;
    setActiveQuizId(id);
    setAnswers(Array(quiz.questions.length).fill(-1));
    setSubmitted(false);
  };
  const submitAnswers = () => {
    if (!activeQuiz || answers.some((answer) => answer < 0)) return;
    const score = Math.round(
      (answers.filter(
        (answer, index) => answer === activeQuiz.questions[index].answerIndex,
      ).length /
        activeQuiz.questions.length) *
        100,
    );
    onUpdate((state) => ({
      ...state,
      quizzes: state.quizzes.map((q) =>
        q.id === activeQuiz.id
          ? { ...q, lastScore: score, lastScoreAt: new Date().toISOString() }
          : q,
      ),
    }));
    setSubmitted(true);
  };
  const removeQuiz = (id: string) => {
    onUpdate((state) => ({
      ...state,
      quizzes: state.quizzes.filter((q) => q.id !== id),
    }));
    if (activeQuizId === id) setActiveQuizId("");
  };
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="PRACTICE, THEN NOTICE"
        title="Quizzes"
        description="Check your understanding with questions made from your own topics and notes."
        action={
          activeQuiz && (
            <button
              className="button button-ghost"
              onClick={() => setActiveQuizId("")}
            >
              <ArrowLeft size={15} /> All quizzes
            </button>
          )
        }
      />
      {activeQuiz ? (
        <Card className="quiz-taking">
          <div className="quiz-taking-head">
            <div>
              <p className="eyebrow">
                {data.subjects.find((s) => s.id === activeQuiz.subjectId)
                  ?.name || "STUDY PRACTICE"}{" "}
                · {activeQuiz.topic}
              </p>
              <h2>{activeQuiz.title}</h2>
              <p>
                {activeQuiz.questions.length} questions · choose one answer each
              </p>
            </div>
            <Tag tone="sage">AI-GENERATED</Tag>
          </div>
          <div className="quiz-question-list">
            {activeQuiz.questions.map((question, i) => (
              <fieldset
                className={`quiz-question ${submitted ? (answers[i] === question.answerIndex ? "answer-correct" : "answer-incorrect") : ""}`}
                key={`${question.question}-${i}`}
              >
                <legend>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {question.question}
                </legend>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <label
                      className={`quiz-option ${answers[i] === optionIndex ? "option-selected" : ""} ${submitted && optionIndex === question.answerIndex ? "option-answer" : ""}`}
                      key={option}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={answers[i] === optionIndex}
                        disabled={submitted}
                        onChange={() =>
                          setAnswers((current) =>
                            current.map((answer, index) =>
                              index === i ? optionIndex : answer,
                            ),
                          )
                        }
                      />
                      <span className="option-letter">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                      {submitted && optionIndex === question.answerIndex && (
                        <Check size={15} />
                      )}
                    </label>
                  ))}
                </div>
                {submitted && (
                  <div className="question-explanation">
                    <Leaf size={14} />
                    <span>
                      {question.explanation ||
                        "Review this answer against your course notes."}
                    </span>
                  </div>
                )}
              </fieldset>
            ))}
          </div>
          <div className="quiz-submit-row">
            {submitted ? (
              <div className="quiz-result-score">
                <span>Your result</span>
                <strong>{activeQuiz.lastScore ?? 0}%</strong>
                <span>
                  {(activeQuiz.lastScore ?? 0) >= 70
                    ? "Nice work—review what felt tricky."
                    : "A useful first pass. Try again after a little review."}
                </span>
              </div>
            ) : (
              <span>
                {answers.filter((a) => a >= 0).length} /{" "}
                {activeQuiz.questions.length} answered
              </span>
            )}
            {submitted ? (
              <button
                className="button button-secondary"
                onClick={() => startQuiz(activeQuiz.id)}
              >
                <RotateCcw size={15} /> Try again
              </button>
            ) : (
              <button
                className="button button-primary"
                onClick={submitAnswers}
                disabled={answers.some((a) => a < 0)}
              >
                Submit answers <ArrowRight size={15} />
              </button>
            )}
          </div>
          <p className="quiz-verify">
            <Leaf size={13} /> Practice material is AI-generated. Check
            explanations against your own source notes.
          </p>
        </Card>
      ) : (
        <div className="quizzes-layout">
          <Card className="quiz-builder">
            <div className="quiz-builder-graphic">
              <span className="quiz-leaf-one">❧</span>
              <span className="quiz-question-glyph">
                <CircleHelp size={23} />
              </span>
            </div>
            <p className="eyebrow">A QUICK KNOWLEDGE CHECK</p>
            <h2>Build a little quiz.</h2>
            <p className="muted-copy">
              Questions are generated from the topic and, if you choose, the
              notes you wrote. Nothing is pulled from an assumed syllabus.
            </p>
            <form className="form-stack" onSubmit={makeQuiz}>
              <label>
                Subject
                <select
                  value={subjectId}
                  onChange={(e) => changeSubject(e.target.value)}
                >
                  <option value="">General topic</option>
                  {data.subjects.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Topic
                <input
                  required
                  maxLength={240}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. SQL joins"
                />
              </label>
              <label>
                Ground it in your notes{" "}
                <span className="optional-label">Optional</span>
                <select
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                >
                  <option value="">Topic only</option>
                  {data.notes
                    .filter((n) => n.content.trim())
                    .map((note) => (
                      <option key={note.id} value={note.id}>
                        {note.title || "Untitled note"}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Question count
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  <option value={3}>3 questions</option>
                  <option value={5}>5 questions</option>
                  <option value={8}>8 questions</option>
                </select>
              </label>
              {error && <div className="inline-error">{error}</div>}
              <LoadingButton
                className="button button-primary button-block"
                type="submit"
                busy={busy}
              >
                <Sparkles size={15} /> Create quiz
              </LoadingButton>
            </form>
            <p className="quiz-builder-foot">
              <Leaf size={13} /> On request, your topic and selected note go to
              Manus AI. Verify the draft.
            </p>
          </Card>
          <div className="quiz-library">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR PRACTICE SHELF</p>
                <h2>
                  Saved quizzes{" "}
                  <span className="count-bubble">{data.quizzes.length}</span>
                </h2>
              </div>
            </div>
            {data.quizzes.length ? (
              <div className="quiz-library-list">
                {data.quizzes.map((quiz) => {
                  const subject = data.subjects.find(
                    (s) => s.id === quiz.subjectId,
                  );
                  return (
                    <Card className="quiz-library-item" key={quiz.id}>
                      <span className="quiz-library-icon">
                        <CircleHelp size={17} />
                      </span>
                      <div className="quiz-library-copy">
                        <p className="eyebrow">{subject?.name || "MY QUIZ"}</p>
                        <h3>{quiz.title}</h3>
                        <span>
                          {quiz.topic} · {quiz.questions.length} questions ·{" "}
                          {new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(quiz.createdAt))}
                        </span>
                      </div>
                      {typeof quiz.lastScore === "number" && (
                        <Tag tone={quiz.lastScore >= 70 ? "sage" : "amber"}>
                          {quiz.lastScore}% last score
                        </Tag>
                      )}
                      <button
                        className="button button-secondary"
                        onClick={() => startQuiz(quiz.id)}
                      >
                        Practice <ArrowRight size={14} />
                      </button>
                      <button
                        className="quiz-delete"
                        aria-label={`Delete ${quiz.title}`}
                        onClick={() => removeQuiz(quiz.id)}
                      >
                        ×
                      </button>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <EmptyState
                  title="Nothing on the practice shelf"
                  message="Choose a topic you added, then build a quiz to see what you remember."
                />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
