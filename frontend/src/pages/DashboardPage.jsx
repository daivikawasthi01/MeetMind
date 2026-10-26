import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const inputTypeLabel = {
  transcript: 'Text',
  transcript_file: 'File',
  audio: 'Audio',
  video: 'Video',
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get('/meetings');
        setMeetings(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load meetings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-paper">
      <nav className="border-b border-rule">
        <div className="container flex items-center justify-between h-[72px]">
          <Link to="/" className="font-display font-medium text-lg tracking-[-0.02em]">
            Meet<span className="text-accent">Mind</span>
          </Link>

          <div className="flex items-center gap-lg">
            <Link to="/meetings/new" className="btn btn--primary text-sm">+ New meeting</Link>

            <div className="flex items-center gap-sm border-l border-rule pl-lg">
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center" aria-hidden="true">
                <span className="measured text-accent">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm text-ink-2 hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-2xl">
        <div className="mb-xl">
          <h1>Welcome back, <span className="text-accent">{user?.name}</span></h1>
          <p className="text-sm text-muted mt-xs">
            {meetings.length > 0
              ? `You have ${meetings.length} meeting${meetings.length === 1 ? '' : 's'}`
              : 'Your meetings will appear here.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-lg rounded-card border border-rule bg-bad-soft text-bad text-sm px-md py-sm" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-card border border-rule bg-paper-2 p-lg animate-pulse motion-reduce:animate-none">
                <div className="flex items-center justify-between mb-md">
                  <div className="h-5 w-16 rounded-pill bg-paper-3" />
                  <div className="h-4 w-12 rounded bg-paper-3" />
                </div>
                <div className="h-5 w-3/4 rounded bg-paper-3 mb-sm" />
                <div className="space-y-2 mb-md">
                  <div className="h-3.5 w-full rounded bg-paper-3" />
                  <div className="h-3.5 w-5/6 rounded bg-paper-3" />
                </div>
                <div className="flex items-center gap-md pt-md border-t border-rule">
                  <div className="h-3.5 w-20 rounded bg-paper-3" />
                  <div className="h-3.5 w-20 rounded bg-paper-3" />
                </div>
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-3xl rounded-card border border-rule bg-paper-2 text-center">
            <svg className="w-8 h-8 text-accent mb-lg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <p className="text-ink-2 text-sm">No meetings yet</p>
            <p className="text-muted text-sm mt-[2px] mb-lg">Create your first meeting to get started</p>
            <Link to="/meetings/new" className="btn btn--primary text-sm">+ Create meeting</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {meetings.map((meeting) => {
              const typeLabel = inputTypeLabel[meeting.inputType] || meeting.inputType;
              const actionCount = meeting.actionItems?.length || 0;
              const decisionCount = meeting.decisions?.length || 0;

              return (
                <Link
                  key={meeting._id}
                  to={`/meetings/${meeting._id}`}
                  className="rounded-card border border-rule bg-paper-2 p-lg hover:border-rule-2 transition-colors duration-[var(--dur-short)]"
                >
                  <div className="flex items-center justify-between mb-md">
                    <span className="measured text-muted px-xs py-[2px] rounded-pill border border-rule">{typeLabel}</span>
                    <span className="text-xs text-muted">
                      {new Date(meeting.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="mb-sm line-clamp-2">{meeting.title}</h3>

                  <p className="text-sm text-muted mb-md line-clamp-2">
                    {meeting.summary || 'No summary available.'}
                  </p>

                  <div className="flex items-center gap-md pt-md border-t border-rule">
                    <span className="measured text-muted">{actionCount} action{actionCount !== 1 ? 's' : ''}</span>
                    <span className="measured text-muted">{decisionCount} decision{decisionCount !== 1 ? 's' : ''}</span>
                    {meeting.status === 'processed' && (
                      <span className="measured text-ok ml-auto">processed</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
