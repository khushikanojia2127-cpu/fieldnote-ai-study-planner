import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Leaf,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { askAssistant } from "../../lib/ai";
import { Card, PageTitle, Tag } from "../../components/UI";
import type { AppData } from "../../types";

type ChatMessage = { id: number; role: "user" | "assistant"; text: string };
const starterPrompts = [
  "Explain a tricky idea simply",
  "Give me a small practice question",
  "Help me make a revision checklist",
];

export function AssistantView({ data }: { data: AppData }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || "");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selectedSubject = data.subjects.find((s) => s.id === subjectId);
  const send = async (text = question) => {
    const clean = text.trim();
    if (!clean || busy) return;
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: clean,
    };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError("");
    setBusy(true);
    try {
      const answer = await askAssistant({
        question: clean,
        subject: selectedSubject?.name || "",
        topic,
        notes: "",
      });
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: answer },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The assistant could not answer just now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-stack assistant-page">
      <PageTitle
        eyebrow="ASK, TEST, UNDERSTAND"
        title="AI study companion"
        description="A patient tutor for the topics you are working through."
        action={
          <Tag tone="paper">
            <Sparkles size={13} /> AI-GENERATED HELP
          </Tag>
        }
      />
      <div className="assistant-layout">
        <Card className="chat-card">
          <div className="chat-header">
            <div className="assistant-orb">
              <Leaf size={20} />
            </div>
            <div>
              <strong>Fieldnote companion</strong>
              <span>
                <span className="online-dot" /> Ready when you are
              </span>
            </div>
            <Tag>STUDY SUPPORT</Tag>
          </div>
          <div className="chat-transcript" aria-live="polite">
            {!messages.length ? (
              <div className="chat-welcome">
                <div className="welcome-sprout">
                  <svg viewBox="0 0 120 110" fill="none">
                    <path
                      d="M61 99C58 72 55 52 39 31"
                      stroke="#62886A"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M39 33C28 31 18 23 15 13C28 8 39 9 46 15C52 20 53 28 51 34Z"
                      fill="#BBD2AE"
                    />
                    <path
                      d="M56 62C67 62 76 55 79 45C81 35 77 26 72 19C60 26 54 34 53 44C52 50 53 57 56 62Z"
                      fill="#D9E3B9"
                    />
                    <path
                      d="M54 73C45 68 35 70 29 77C23 84 23 93 24 101C39 98 49 92 53 84"
                      fill="#91B28A"
                    />
                    <path
                      d="M61 99C61 73 65 52 76 34"
                      stroke="#62886A"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="eyebrow">A PLACE TO THINK OUT LOUD</p>
                <h2>
                  What are you
                  <br />
                  working through?
                </h2>
                <p>
                  Ask for an explanation, an example, or a quick knowledge
                  check. We’ll keep it grounded and make room for your own
                  thinking.
                </p>
                <div className="prompt-chips">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} onClick={() => setQuestion(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message) => (
                  <div
                    className={`chat-message ${message.role === "user" ? "message-user" : "message-ai"}`}
                    key={message.id}
                  >
                    <span className="message-avatar">
                      {message.role === "user" ? (
                        <UserRound size={15} />
                      ) : (
                        <Leaf size={15} />
                      )}
                    </span>
                    <div className="message-body">
                      <div className="message-meta">
                        {message.role === "user" ? "YOU" : "FIELDNOTE · AI"}
                        {message.role === "assistant" && (
                          <Tag tone="sage">AI draft</Tag>
                        )}
                      </div>
                      <p>{message.text}</p>
                      {message.role === "assistant" && (
                        <span className="verify-line">
                          <CheckCircle2 size={13} /> Check important details
                          against your course material.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="chat-message message-ai">
                    <span className="message-avatar">
                      <Leaf size={15} />
                    </span>
                    <div className="message-body">
                      <div className="message-meta">FIELDNOTE · AI</div>
                      <p className="thinking-text">
                        <LoaderCircle size={15} className="spin" /> Thinking
                        through your question…
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {error && (
            <div className="ai-error">
              <span>{error}</span>
              <button onClick={() => send(messages.at(-1)?.text || "")}>
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          )}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="chat-context-select">
              <BookOpen size={14} />
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopic("");
                }}
                aria-label="Choose subject context"
              >
                <option value="">General question</option>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {selectedSubject?.topics.length ? (
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  aria-label="Choose topic"
                >
                  <option value="">Choose topic</option>
                  {selectedSubject.topics.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="composer-input">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                maxLength={3000}
                placeholder="Ask about a concept, or tell me where you got stuck…"
                aria-label="Your study question"
              />
              <button
                aria-label="Send question"
                className="send-button"
                type="submit"
                disabled={!question.trim() || busy}
              >
                <ArrowUp size={18} />
              </button>
            </div>
            <div className="composer-foot">
              <span>Shift + Enter for a new line</span>
              <span>{question.length}/3,000</span>
            </div>
          </form>
        </Card>
        <aside className="assistant-side">
          <Card className="ai-guidelines">
            <div className="guideline-icon">
              <Leaf size={17} />
            </div>
            <p className="eyebrow">LEARN WITH CARE</p>
            <h3>Good learning stays yours.</h3>
            <p>
              Use this companion to explore an idea—not to replace your notes,
              your teacher, or your own understanding.
            </p>
            <div className="guideline-rule" />
            <ul>
              <li>Ask for examples, not just answers</li>
              <li>Check key facts against your course</li>
              <li>Rewrite the idea in your own words</li>
            </ul>
          </Card>
          <Card className="context-card">
            <p className="eyebrow">YOUR CONTEXT</p>
            {selectedSubject ? (
              <>
                <h3>{selectedSubject.name}</h3>
                <p>
                  {topic ||
                    "Choose a topic above if you want a more focused reply."}
                </p>
                <div className="context-topics">
                  {selectedSubject.topics.slice(0, 4).map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3>Starting fresh</h3>
                <p>Choose a subject above, or ask a general question.</p>
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
