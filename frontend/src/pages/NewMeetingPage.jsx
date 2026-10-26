import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const MODES = [
  { id: 'paste', label: 'Paste text' },
  { id: 'file', label: 'Upload file' },
  { id: 'audio', label: 'Upload audio' },
  { id: 'video', label: 'Upload video' },
];

const NewMeetingPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [inputMode, setInputMode] = useState('paste'); // 'paste', 'file', 'audio', or 'video'
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm'];
  const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25 MB
  const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate extension
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Only .txt, .md, and .pdf files are allowed.');
      setFile(null);
      e.target.value = '';
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 2 MB.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleAudioChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      setAudioFile(null);
      return;
    }

    // Validate extension
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
      setError('Only .mp3, .wav, .m4a, and .webm audio files are allowed.');
      setAudioFile(null);
      e.target.value = '';
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_AUDIO_SIZE) {
      setError('Audio file is too large. Maximum size is 25 MB.');
      setAudioFile(null);
      e.target.value = '';
      return;
    }

    setAudioFile(selectedFile);
  };

  const handleVideoChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      setVideoFile(null);
      return;
    }

    // Validate extension
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
      setError('Only .mp4, .mov, and .webm video files are allowed.');
      setVideoFile(null);
      e.target.value = '';
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_VIDEO_SIZE) {
      setError('Video file is too large. Maximum size is 50 MB.');
      setVideoFile(null);
      e.target.value = '';
      return;
    }

    setVideoFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }

    if (inputMode === 'paste' && transcript.trim().length < 10) {
      setError('Transcript is too short to extract meaningful data.');
      return;
    }

    if (inputMode === 'file' && !file) {
      setError('Please select a transcript file to upload.');
      return;
    }

    if (inputMode === 'audio' && !audioFile) {
      setError('Please select an audio file to upload.');
      return;
    }

    if (inputMode === 'video' && !videoFile) {
      setError('Please select a video file to upload.');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (inputMode === 'paste') {
        setLoadingMessage('Extracting AI insights...');
        response = await api.post('/meetings/text', { title, transcript });
      } else if (inputMode === 'file') {
        setLoadingMessage('Processing file...');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('transcriptFile', file);
        response = await api.post('/meetings/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (inputMode === 'audio') {
        setLoadingMessage('Transcribing audio... this may take a minute');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('audioFile', audioFile);
        response = await api.post('/meetings/audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (inputMode === 'video') {
        setLoadingMessage('Extracting audio from video & transcribing...');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('videoFile', videoFile);
        response = await api.post('/meetings/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Redirect to the meeting detail page — polling will handle the rest
      navigate(`/meetings/${response.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Failed to process meeting.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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

      <main className="container max-w-[864px] py-2xl">
        <div className="mb-xl">
          <h1>New meeting</h1>
          <p className="text-muted mt-sm">Paste a transcript, or upload a file, audio, or video to extract insights.</p>
        </div>

        {error && (
          <div className="mb-lg rounded-card border border-rule bg-bad-soft text-bad text-sm px-md py-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div>
            <label htmlFor="title" className="field-label">Meeting title</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field"
              placeholder="e.g. Q3 Roadmap Planning"
            />
          </div>

          <div>
            <span className="field-label">Input method</span>
            <div className="flex flex-wrap gap-xs" role="group" aria-label="Input method">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setInputMode(mode.id)}
                  aria-pressed={inputMode === mode.id}
                  className={inputMode === mode.id ? 'btn btn--primary text-sm' : 'btn text-sm'}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {inputMode === 'paste' && (
            <div>
              <label htmlFor="transcript" className="field-label">Transcript text</label>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                className="field resize-y"
                placeholder="Paste the raw meeting transcript here..."
              />
            </div>
          )}

          {inputMode === 'file' && (
            <div>
              <label htmlFor="transcriptFile" className="field-label">Transcript file</label>
              <input
                id="transcriptFile"
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileChange}
                className="field cursor-pointer file:mr-md file:py-xs file:px-md file:rounded-pill file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-ink hover:file:bg-accent/90 file:cursor-pointer"
              />
              <p className="mt-xs text-sm text-muted">Supported: .txt, .md, .pdf (max 2 MB)</p>

              {file && (
                <div className="mt-sm flex items-center gap-sm rounded-card border border-rule bg-paper-2 px-md py-sm text-sm">
                  <span className="text-ink-2">{file.name}</span>
                  <span className="measured text-muted">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          )}

          {inputMode === 'audio' && (
            <div>
              <label htmlFor="audioFile" className="field-label">Audio file</label>
              <input
                id="audioFile"
                type="file"
                accept=".mp3,.wav,.m4a,.webm,audio/*"
                onChange={handleAudioChange}
                className="field cursor-pointer file:mr-md file:py-xs file:px-md file:rounded-pill file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-ink hover:file:bg-accent/90 file:cursor-pointer"
              />
              <p className="mt-xs text-sm text-muted">Supported: .mp3, .wav, .m4a, .webm (max 25 MB)</p>

              {audioFile && (
                <div className="mt-sm flex items-center gap-sm rounded-card border border-rule bg-paper-2 px-md py-sm text-sm">
                  <span className="text-ink-2">{audioFile.name}</span>
                  <span className="measured text-muted">{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              )}
            </div>
          )}

          {inputMode === 'video' && (
            <div>
              <label htmlFor="videoFile" className="field-label">Video file</label>
              <input
                id="videoFile"
                type="file"
                accept=".mp4,.mov,.webm,video/*"
                onChange={handleVideoChange}
                className="field cursor-pointer file:mr-md file:py-xs file:px-md file:rounded-pill file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-ink hover:file:bg-accent/90 file:cursor-pointer"
              />
              <p className="mt-xs text-sm text-muted">Supported: .mp4, .mov, .webm (max 50 MB)</p>

              {videoFile && (
                <div className="mt-sm flex items-center gap-sm rounded-card border border-rule bg-paper-2 px-md py-sm text-sm">
                  <span className="text-ink-2">{videoFile.name}</span>
                  <span className="measured text-muted">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="btn btn--primary">
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-accent-ink/30 border-t-accent-ink rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  {loadingMessage || 'Uploading...'}
                </>
              ) : (
                'Process meeting'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewMeetingPage;
