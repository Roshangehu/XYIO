import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  RotateCcw,
  CalendarDays,
  Clock,
  BookOpen,
} from "lucide-react";
import "./TimetableMaker.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialSchedule = [
  {
    id: 1,
    day: "Monday",
    subject: "DSA Practice",
    start: "09:00",
    end: "10:00",
    color: "#dce9ff",
  },
  {
    id: 2,
    day: "Monday",
    subject: "System Design",
    start: "11:00",
    end: "12:00",
    color: "#e8e0ff",
  },
  {
    id: 3,
    day: "Tuesday",
    subject: "GenAI Learning",
    start: "10:00",
    end: "11:00",
    color: "#dff3e8",
  },
];

const colors = [
  "#dce9ff",
  "#e8e0ff",
  "#dff3e8",
  "#ffe9d9",
  "#ffe2e8",
  "#fff2c9",
];

export default function TimetableMaker() {
  const [title, setTitle] = useState("My Weekly Timetable");

  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-timetable");
      return saved ? JSON.parse(saved) : initialSchedule;
    } catch {
      return initialSchedule;
    }
  });

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [subject, setSubject] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    localStorage.setItem("xylo-timetable", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("xylo-timetable-title", title);
  }, [title]);

  useEffect(() => {
    const savedTitle = localStorage.getItem("xylo-timetable-title");
    if (savedTitle) setTitle(savedTitle);
  }, []);

  const addActivity = (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      alert("Please enter an activity or subject name.");
      return;
    }

    if (start >= end) {
      alert("End time must be later than start time.");
      return;
    }

    const newActivity = {
      id: Date.now(),
      day: selectedDay,
      subject: subject.trim(),
      start,
      end,
      color,
    };

    setSchedule((prev) => [...prev, newActivity]);
    setSubject("");
  };

  const deleteActivity = (id) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const resetSchedule = () => {
    if (window.confirm("Reset your entire timetable?")) {
      setSchedule([]);
      setTitle("My Weekly Timetable");
    }
  };

  const downloadTimetable = () => {
    window.print();
  };

  const getDayActivities = (day) =>
    schedule
      .filter((item) => item.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));

  const totalActivities = schedule.length;
  const activeDays = new Set(schedule.map((item) => item.day)).size;

  return (
    <div className="timetable-tool">
      <header className="timetable-header">
        <div>
          <div className="timetable-breadcrumb">XYLO / CREATE & BUILD</div>
          <h1>Timetable Maker</h1>
          <p>
            Organize your weekly routine, plan your classes, and manage your
            time better.
          </p>
        </div>

        <div className="timetable-header-icon">
          <CalendarDays size={28} />
        </div>
      </header>

      <div className="timetable-toolbar">
        <div className="timetable-save-status">
          <span />
          Automatically saved in this browser
        </div>

        <div className="timetable-toolbar-actions">
          <button
            className="timetable-secondary-btn"
            onClick={resetSchedule}
            type="button"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="timetable-primary-btn"
            onClick={downloadTimetable}
            type="button"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="timetable-layout">
        <aside className="timetable-editor">
          <div className="timetable-editor-heading">
            <span className="timetable-eyebrow">CUSTOMIZE</span>
            <h2>Create your schedule</h2>
            <p>Add classes, study sessions, meetings, or activities.</p>
          </div>

          <form onSubmit={addActivity}>
            <label>
              Timetable name
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Weekly Timetable"
              />
            </label>

            <label>
              Day
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Activity / Subject
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
              />
            </label>

            <div className="timetable-time-fields">
              <label>
                Start time
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>

              <label>
                End time
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>

            <div className="timetable-color-picker">
              <span>Choose a color</span>
              <div>
                {colors.map((itemColor) => (
                  <button
                    key={itemColor}
                    type="button"
                    className={color === itemColor ? "selected" : ""}
                    style={{ background: itemColor }}
                    onClick={() => setColor(itemColor)}
                    aria-label={`Choose color ${itemColor}`}
                  />
                ))}
              </div>
            </div>

            <button className="timetable-primary-btn timetable-add-btn" type="submit">
              <Plus size={17} />
              Add to timetable
            </button>
          </form>

          <div className="timetable-stats">
            <div>
              <CalendarDays size={17} />
              <span>Scheduled activities</span>
              <strong>{totalActivities}</strong>
            </div>

            <div>
              <Clock size={17} />
              <span>Active days</span>
              <strong>{activeDays}/7</strong>
            </div>
          </div>
        </aside>

        <main className="timetable-main">
          <div className="timetable-main-heading">
            <div>
              <span className="timetable-eyebrow">YOUR WEEK AT A GLANCE</span>
              <h2>{title}</h2>
            </div>
            <BookOpen size={22} />
          </div>

          <div className="timetable-grid">
            {days.map((day) => {
              const activities = getDayActivities(day);

              return (
                <section className="timetable-day" key={day}>
                  <div className="timetable-day-heading">
                    <h3>{day}</h3>
                    <span>{activities.length}</span>
                  </div>

                  <div className="timetable-day-content">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <div
                          className="timetable-activity"
                          key={activity.id}
                          style={{ background: activity.color }}
                        >
                          <div className="timetable-activity-top">
                            <strong>{activity.subject}</strong>

                            <button
                              type="button"
                              onClick={() => deleteActivity(activity.id)}
                              aria-label="Delete activity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="timetable-activity-time">
                            <Clock size={12} />
                            {activity.start} – {activity.end}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="timetable-empty-day">
                        <span>Nothing planned</span>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="timetable-footer-note">
            <Clock size={15} />
            <span>Your schedule is stored locally in your browser.</span>
          </div>
        </main>
      </div>
    </div>
  );
}