import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Edit mode state ──
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/meetings/${id}`);
        setMeeting(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load meeting.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  // ── Polling: re-fetch while status is 'processing' ──
  const pollingRef = useRef(null);

  useEffect(() => {
    // Start polling only when the meeting exists and is still processing
    if (meeting && meeting.status === 'processing') {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/meetings/${id}`);
          setMeeting(res.data);

          // Stop polling once the status resolves
          if (res.data.status !== 'processing') {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } catch (err) {
          console.error('Polling error:', err.message);
        }
      }, 3000);
    }

    // Cleanup on unmount or when status changes
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [meeting?.status, id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/meetings/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meeting.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Edit helpers ──

  /** Enter edit mode: snapshot current meeting data into editData */
  const enterEditMode = () => {
    setEditData({
      title: meeting.title,
      summary: meeting.summary || '',
      actionItems: meeting.actionItems?.map((item) => ({
        task: item.task,
        owner: item.owner || 'Unassigned',
        deadline: item.deadline || '',
      })) || [],
      decisions: [...(meeting.decisions || [])],
    });
    setSaveError('');
    setIsEditing(true);
  };

  /** Cancel editing and discard changes */
  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setSaveError('');
  };

  /** Save changes to backend */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      // Filter out empty decisions before saving
      const payload = {
        ...editData,
        decisions: editData.decisions.filter((d) => d.trim() !== ''),
      };
      const res = await api.put(`/meetings/${id}`, payload);
      setMeeting(res.data);
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Failed to save changes.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Action item helpers ──
  const updateActionItem = (index, field, value) => {
    setEditData((prev) => {
      const updated = [...prev.actionItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, actionItems: updated };
    });
  };

  const removeActionItem = (index) => {
    setEditData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index),
    }));
  };

  const addActionItem = () => {
    setEditData((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, { task: '', owner: 'Unassigned', deadline: '' }],
    }));
  };

  // ── Decision helpers ──
  const updateDecision = (index, value) => {
    setEditData((prev) => {
      const updated = [...prev.decisions];
      updated[index] = value;
      return { ...prev, decisions: updated };
    });
  };

  const removeDecision = (index) => {
    setEditData((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((_, i) => i !== index),
    }));
  };

  const addDecision = () => {
    setEditData((prev) => ({
      ...prev,
      decisions: [...prev.decisions, ''],
    }));
  };

  // Input type label
  const inputTypeLabel = {
    transcript: 'Pasted text',
    transcript_file: 'File upload',
    audio: 'Audio',
    video: 'Video',
  };

  /** Format a date for the "Last edited" display */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-paper">
        <nav className="border-b border-rule">
          <div className="container flex items-center justify-between h-[72px]">
            <div className="font-display font-medium text-lg tracking-[-0.02em]">
              Meet<span className="text-accent">Mind</span>
            </div>
            <div className="h-4 w-32 rounded bg-paper-3 animate-pulse motion-reduce:animate-none" />
          </div>
        </nav>

        <main className="container py-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-xl animate-pulse motion-reduce:animate-none">
            <div className="flex-1 min-w-0">
              <div className="h-8 w-2/3 rounded bg-paper-3 mb-sm" />
              <div className="flex items-center gap-sm">
                <div className="h-4 w-20 rounded bg-paper-3" />
                <div className="h-4 w-24 rounded bg-paper-3" />
              </div>
            </div>
            <div className="flex items-center gap-xs">
              <div className="h-9 w-20 rounded-pill bg-paper-3" />
              <div className="h-9 w-20 rounded-pill bg-paper-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 flex flex-col gap-lg animate-pulse motion-reduce:animate-none">
              <div className="rounded-card border border-rule bg-paper-2 p-lg">
                <div className="h-5 w-24 rounded bg-paper-3 mb-md" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-paper-3" />
                  <div className="h-4 w-full rounded bg-paper-3" />
                  <div className="h-4 w-3/4 rounded bg-paper-3" />
                </div>
              </div>
              <div className="rounded-card border border-rule bg-paper-2 p-lg">
                <div className="h-5 w-32 rounded bg-paper-3 mb-md" />
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center justify-between p-md bg-paper-3 rounded-[var(--radius-card)]">
                      <div className="h-4 w-1/2 rounded bg-paper-2" />
                      <div className="flex items-center gap-xs">
                        <div className="h-5 w-16 rounded bg-paper-2" />
                        <div className="h-5 w-16 rounded bg-paper-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 animate-pulse motion-reduce:animate-none">
              <div className="rounded-card border border-rule bg-paper-2 p-lg">
                <div className="h-5 w-36 rounded bg-paper-3 mb-md" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="h-3.5 rounded bg-paper-3" style={{ width: `${60 + ((n * 37) % 40)}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col items-center justify-center gap-md px-md">
        <div className="rounded-card border border-rule bg-bad-soft text-bad text-sm max-w-md text-center px-md py-sm" role="alert">
          {error}
        </div>
        <Link to="/dashboard" className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const typeLabel = inputTypeLabel[meeting.inputType] || meeting.inputType;
  const wasEdited = meeting.updatedAt && meeting.updatedAt !== meeting.createdAt;

  // ── Processing screen ──
  if (meeting.status === 'processing') {
    return (
      <div className="min-h-dvh bg-paper">
        <nav className="border-b border-rule">
          <div className="container flex items-center justify-between h-[72px]">
            <Link to="/dashboard" className="font-display font-medium text-lg tracking-[-0.02em]">
              Meet<span className="text-accent">Mind</span>
            </Link>
            <Link to="/dashboard" className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">
              Back to dashboard
            </Link>
          </div>
        </nav>

        <main className="container max-w-[640px] py-3xl flex flex-col items-center text-center">
          <div className="relative mb-lg" aria-hidden="true">
            <div className="w-16 h-16 rounded-full border-4 border-rule" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-accent animate-spin motion-reduce:animate-none" />
          </div>

          <h1>{meeting.title}</h1>
          <p className="text-muted mt-sm mb-lg">AI is analyzing your meeting…</p>

          <div className="w-full max-w-sm">
            <div className="rounded-card border border-rule bg-paper-2 divide-y divide-rule">
              <div className="flex items-center gap-sm px-md py-sm">
                <span className="measured text-ok">done</span>
                <span className="text-sm text-ink-2">File uploaded</span>
              </div>
              <div className="flex items-center gap-sm px-md py-sm">
                <span className="w-3.5 h-3.5 border-2 border-rule-2 border-t-accent rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <span className="text-sm text-ink-2">Extracting insights…</span>
              </div>
              <div className="flex items-center gap-sm px-md py-sm opacity-50">
                <span className="measured text-muted">next</span>
                <span className="text-sm text-muted">Ready for review</span>
              </div>
            </div>
          </div>

          <p className="text-muted text-sm mt-lg">This page will update automatically.</p>
        </main>
      </div>
    );
  }

  // ── Failed screen ──
  if (meeting.status === 'failed') {
    return (
      <div className="min-h-dvh bg-paper">
        <nav className="border-b border-rule">
          <div className="container flex items-center justify-between h-[72px]">
            <Link to="/dashboard" className="font-display font-medium text-lg tracking-[-0.02em]">
              Meet<span className="text-accent">Mind</span>
            </Link>
            <Link to="/dashboard" className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">
              Back to dashboard
            </Link>
          </div>
        </nav>

        <main className="container max-w-[520px] py-3xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-bad-soft flex items-center justify-center mb-lg">
            <svg className="w-7 h-7 text-bad" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>

          <h1>Processing failed</h1>
          <p className="text-muted mt-sm mb-md">{meeting.title}</p>

          <div className="w-full rounded-card border border-rule bg-bad-soft text-bad text-sm px-md py-sm mb-lg">
            {meeting.errorMessage || 'An unknown error occurred during processing.'}
          </div>

          <div className="flex items-center gap-sm">
            <Link to="/meetings/new" className="btn btn--primary text-sm">Try again</Link>
            <button onClick={handleDelete} disabled={isDeleting} className="btn text-sm text-bad">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper">
      <nav className="border-b border-rule">
        <div className="container flex items-center justify-between h-[72px]">
          <Link to="/dashboard" className="font-display font-medium text-lg tracking-[-0.02em]">
            Meet<span className="text-accent">Mind</span>
          </Link>
          <Link to="/dashboard" className="text-sm text-muted hover:text-ink transition-colors duration-[var(--dur-short)]">
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="container py-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-xl">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                className="field text-2xl sm:text-3xl font-display font-medium mb-sm"
                placeholder="Meeting title"
              />
            ) : (
              <h1 className="mb-sm break-words">{meeting.title}</h1>
            )}
            <div className="flex flex-wrap items-center text-sm text-muted">
              <span>{typeLabel}</span>
              <span className="border-l border-rule mx-sm h-3.5" aria-hidden="true" />
              <span>{formatDate(meeting.createdAt)}</span>
              {wasEdited && (
                <>
                  <span className="border-l border-rule mx-sm h-3.5" aria-hidden="true" />
                  <span title={formatDateTime(meeting.updatedAt)}>Edited {formatDateTime(meeting.updatedAt)}</span>
                </>
              )}
              {meeting.sourceFileName && (
                <>
                  <span className="border-l border-rule mx-sm h-3.5" aria-hidden="true" />
                  <span>{meeting.sourceFileName}</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-xs flex-shrink-0">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={isSaving} className="btn btn--primary text-sm">
                  {isSaving && <span className="w-3.5 h-3.5 border-2 border-accent-ink/30 border-t-accent-ink rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button onClick={cancelEdit} disabled={isSaving} className="btn text-sm">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={enterEditMode} className="btn text-sm">
                  Edit
                </button>

                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn text-sm text-bad">
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-xs">
                    <span className="text-sm text-muted">Sure?</span>
                    <button onClick={handleDelete} disabled={isDeleting} className="btn text-sm text-bad">
                      {isDeleting ? 'Deleting...' : 'Yes'}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="btn text-sm">
                      No
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mb-lg rounded-card border border-rule bg-bad-soft text-bad text-sm px-md py-sm" role="alert">
            {saveError}
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Left column — AI insights (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-lg">
            {/* Summary */}
            <div className="rounded-card border border-rule bg-paper-2 p-lg">
              <h2 className="card-title mb-sm">Summary</h2>
              {isEditing ? (
                <textarea
                  value={editData.summary}
                  onChange={(e) => setEditData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="field resize-none min-h-[120px]"
                  placeholder="Meeting summary..."
                  rows={5}
                />
              ) : (
                <p className="text-ink-2">{meeting.summary || 'No summary available.'}</p>
              )}
            </div>

            {/* Action items */}
            <div className="rounded-card border border-rule bg-paper-2 p-lg">
              <h2 className="card-title mb-md flex items-center gap-sm">
                Action items
                {(() => {
                  const items = isEditing ? editData.actionItems : meeting.actionItems;
                  return items?.length > 0 && (
                    <span className="measured text-muted">{items.length}</span>
                  );
                })()}
              </h2>

              {isEditing ? (
                <div className="flex flex-col gap-sm">
                  {editData.actionItems.map((item, i) => (
                    <div key={i} className="p-md bg-paper-3 rounded-[var(--radius-card)] flex flex-col gap-sm">
                      <div className="flex items-start gap-sm">
                        <div className="flex-1 flex flex-col gap-xs">
                          <input
                            type="text"
                            value={item.task}
                            onChange={(e) => updateActionItem(i, 'task', e.target.value)}
                            className="field"
                            placeholder="Task description"
                          />
                          <div className="flex gap-xs">
                            <input
                              type="text"
                              value={item.owner}
                              onChange={(e) => updateActionItem(i, 'owner', e.target.value)}
                              className="field flex-1"
                              placeholder="Owner"
                            />
                            <input
                              type="text"
                              value={item.deadline}
                              onChange={(e) => updateActionItem(i, 'deadline', e.target.value)}
                              className="field flex-1"
                              placeholder="Deadline"
                            />
                          </div>
                        </div>
                        <button onClick={() => removeActionItem(i)} className="btn text-sm text-bad">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addActionItem} className="btn text-sm w-full">
                    + Add action item
                  </button>
                </div>
              ) : (
                meeting.actionItems?.length > 0 ? (
                  <div className="rounded-[var(--radius-card)] overflow-hidden divide-y divide-rule">
                    {meeting.actionItems.map((item, i) => (
                      <div key={item._id || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-xs bg-paper-3 px-md py-sm">
                        <span className="text-ink-2 text-sm">{item.task}</span>
                        <div className="flex items-center gap-sm flex-shrink-0">
                          <span className="measured text-accent">{item.owner || 'Unassigned'}</span>
                          {item.deadline && <span className="measured text-cool">{item.deadline}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted italic">No action items detected.</p>
                )
              )}
            </div>

            {/* Decisions */}
            <div className="rounded-card border border-rule bg-paper-2 p-lg">
              <h2 className="card-title mb-sm flex items-center gap-sm">
                Key decisions
                {(() => {
                  const items = isEditing ? editData.decisions : meeting.decisions;
                  return items?.length > 0 && (
                    <span className="measured text-muted">{items.length}</span>
                  );
                })()}
              </h2>

              {isEditing ? (
                <div className="flex flex-col gap-xs">
                  {editData.decisions.map((decision, i) => (
                    <div key={i} className="flex items-center gap-xs">
                      <input
                        type="text"
                        value={decision}
                        onChange={(e) => updateDecision(i, e.target.value)}
                        className="field flex-1"
                        placeholder="Decision"
                      />
                      <button onClick={() => removeDecision(i)} className="btn text-sm text-bad flex-shrink-0">
                        Remove
                      </button>
                    </div>
                  ))}
                  <button onClick={addDecision} className="btn text-sm w-full">
                    + Add decision
                  </button>
                </div>
              ) : (
                meeting.decisions?.length > 0 ? (
                  <div className="rounded-[var(--radius-card)] overflow-hidden divide-y divide-rule">
                    {meeting.decisions.map((decision, i) => (
                      <div key={i} className="bg-paper-3 px-md py-sm">
                        <span className="text-ink-2 text-sm">{decision}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted italic">No key decisions detected.</p>
                )
              )}
            </div>
          </div>

          {/* Right column — Transcript (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="rounded-card border border-rule bg-paper-2 p-lg lg:sticky lg:top-lg">
              <h2 className="card-title mb-sm">Original transcript</h2>
              {meeting.rawText ? (
                <div className="max-h-[600px] overflow-y-auto pr-xs">
                  <p className="text-ink-2 text-sm whitespace-pre-wrap">{meeting.rawText}</p>
                </div>
              ) : (
                <p className="text-muted italic text-sm">Transcript not available.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingDetailPage;
