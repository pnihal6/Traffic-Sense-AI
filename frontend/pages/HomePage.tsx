import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import { XCircleIcon } from '../components/Icons';
import { Session, VehicleCount } from '../types';
import { API_BASE, fetchModels, uploadVideo, startStream, stopStream, fetchStats, saveSession, ModelChoice } from '../lib/api';

const VEHICLE_COLORS: Record<VehicleCount['type'], { light: string; dark: string }> = {
  'Car': { light: '#2563eb', dark: '#60a5fa' },
  'Truck': { light: '#dc2626', dark: '#f87171' },
  'Bus': { light: '#16a34a', dark: '#4ade80' },
  'Van': { light: '#d97706', dark: '#facc15' },
};

const Spinner: React.FC = () => (
  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

type StreamSlot = { url: string | null; isInferencing: boolean; sid: number; sourceLabel?: string };

const VideoStreamPlayer: React.FC<{
  index: number;
  stream: StreamSlot;
  onStop: (index: number) => void;
  overlay: {
    total: number;
    breakdown: VehicleCount[];
    fps_in: number;
    fps_proc: number;
    status: string;
    model_file?: string;
  } | null;
  isInitializing: boolean;
  error: string | null;
}> = ({ index, stream, onStop, overlay, isInitializing, error }) => {
  if (!stream.url) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-light-border dark:border-dark-border">
        <p className="text-gray-500">Video Stream {index + 1}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group shadow-lg">
      {/* MJPEG stream from backend */}
      <img
        src={stream.url}
        alt={`Stream ${index + 1}`}
        className="w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* Connecting overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
          <Spinner />
          <p className="mt-4 text-lg font-semibold">Connecting to inference server...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm p-4">
          <XCircleIcon size={40} className="text-red-300 mb-2" />
          <p className="text-lg font-bold">Connection Error</p>
          <p className="text-sm text-red-200 text-center">{error}</p>
        </div>
      )}

      {/* Stats overlay */}
      {!isInitializing && !error && overlay && stream.isInferencing && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent text-white transition-opacity duration-300 z-10">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              Total Vehicles: {overlay.total}
            </p>
            {stream.sourceLabel && (
              <p className="text-[11px] opacity-80">{stream.sourceLabel}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 text-xs mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            {overlay.breakdown.map(v => (
              <p key={v.type}>{v.type}: <strong>{v.count}</strong></p>
            ))}
          </div>
          <p className="text-xs mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            FPS In: <strong>{overlay.fps_in.toFixed(1)}</strong> · FPS Proc: <strong>{overlay.fps_proc.toFixed(1)}</strong>
          </p>
        </div>
      )}

      {/* Stop button */}
      <button
        onClick={() => onStop(index)}
        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 z-30 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
        aria-label={`Stop stream ${index + 1}`}
      >
        <XCircleIcon size={20} />
      </button>
    </div>
  );
};

const HomePage: React.FC = () => {
  // config states
  const [confidence, setConfidence] = useState(50);
  const [imageSize, setImageSize] = useState(640);
  const [skipFrames, setSkipFrames] = useState(0);

  // model list from backend
  const [models, setModels] = useState<ModelChoice[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const modelFile = useMemo(() => {
    const m = models.find(m => m.name === selectedModel);
    return m?.file || "";
  }, [models, selectedModel]);

  // source input
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4 stream slots
  const [streams, setStreams] = useState<StreamSlot[]>(
    [...Array(4)].map((_, i) => ({ url: null, isInferencing: false, sid: i + 1 }))
  );

  // per-slot UI state
  const [initState, setInitState] = useState<boolean[]>([false, false, false, false]);
  const [errors, setErrors] = useState<(string | null)[]>([null, null, null, null]);

  // live stats (polled each 1000ms)
  const [stats, setStats] = useState<Array<{
    total: number;
    breakdown: VehicleCount[];
    fps_in: number;
    fps_proc: number;
    status: string;
    model_file?: string;
  } | null>>([null, null, null, null]);

  // timers for polling per sid
  const pollTimers = useRef<Record<number, number>>({});

  // fetch model list on mount
  useEffect(() => {
    fetchModels().then(list => {
      setModels(list);
      if (list.length > 0) setSelectedModel(list[0].name);
    }).catch(() => {
      // ignore for now
    });
  }, []);

  // handle local file upload -> we upload to backend on start
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalFileName(file.name);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrlInput(e.target.value);
    if (localFileName) setLocalFileName(null);
    if (e.target.value.startsWith('blob:') && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pickFirstEmptySid = () => {
    const idx = streams.findIndex(s => s.url === null && !s.isInferencing);
    return idx === -1 ? -1 : idx;
  };

  const smartSourceLabel = (source: string, uploadedName?: string | null) => {
    const lower = source.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return 'YouTube Stream';
    }
    if (lower.startsWith('rtsp://')) return 'RTSP Camera';
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      const last = source.split('/').pop() || 'Online Video';
      return `Online Video - ${last}`;
    }
    if (uploadedName) return `Local Video - ${uploadedName}`;
    const last = source.split(/[\\/]/).pop() || 'Local Video';
    return `Local Video - ${last}`;
  };

  const handleStartInference = async () => {
    try {
      if (!selectedModel || !modelFile) {
        alert("Select a model first.");
        return;
      }
      // choose slot
      const slotIndex = pickFirstEmptySid();
      if (slotIndex === -1) {
        alert("All video slots are in use. Stop a stream to add a new one.");
        return;
      }
      const sid = streams[slotIndex].sid;

      // source handling: upload if user picked a local file
      let sourceToUse = videoUrlInput.trim();
      let sourceLabel = '';
      if ((!sourceToUse || sourceToUse.startsWith('blob:')) && fileInputRef.current?.files?.[0]) {
        setInitState(prev => prev.map((v, i) => i === slotIndex ? true : v));
        const uploadedPath = await uploadVideo(fileInputRef.current.files[0]);
        sourceToUse = uploadedPath; // absolute path from backend
        sourceLabel = smartSourceLabel(sourceToUse, fileInputRef.current.files[0].name);
      } else {
        if (!sourceToUse) {
          alert('Enter a stream URL or upload a local file.');
          return;
        }
        sourceLabel = smartSourceLabel(sourceToUse, localFileName);
      }

      // loading overlay ON
      setInitState(prev => prev.map((v, i) => i === slotIndex ? true : v));
      setErrors(prev => prev.map((v, i) => i === slotIndex ? null : v));

      // call backend to start
      await startStream({
        sid,
        model_file: modelFile,
        source: sourceToUse,
        conf: confidence / 100,
        imgsz: imageSize,
        interval: Math.max(1, skipFrames || 1),
      });

      // point <img> to MJPEG endpoint
      const mjpegUrl = `${API_BASE}/streams/mjpeg?sid=${sid}`;
      setStreams(prev => {
        const next = [...prev];
        next[slotIndex] = { url: mjpegUrl, isInferencing: true, sid, sourceLabel };
        return next;
      });

      // begin polling stats every 1000ms
      if (pollTimers.current[sid]) window.clearInterval(pollTimers.current[sid]);
      pollTimers.current[sid] = window.setInterval(async () => {
        try {
          const s = await fetchStats(sid);
          // convert backend counts -> VehicleCount[]
          const counts = s.counts || {};
          const breakdown: VehicleCount[] = [
            { type: 'Car', count: counts.car || 0 },
            { type: 'Van', count: counts.van || 0 },
            { type: 'Truck', count: counts.truck || 0 },
            { type: 'Bus', count: counts.bus || 0 },
          ];
          const overlay = {
            total: breakdown.reduce((sum, v) => sum + v.count, 0),
            breakdown,
            fps_in: Number(s.fps_in || 0),
            fps_proc: Number(s.fps_proc || 0),
            status: s.status || "running",
            model_file: s.model_file,
          };
          setStats(prev => {
            const copy = [...prev];
            copy[slotIndex] = overlay;
            return copy;
          });
          // hide "connecting" once stats arrive
          setInitState(prev => prev.map((v, i) => i === slotIndex ? false : v));
        } catch {
          // keep polling; 404 means stopped
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start stream");
      // turn off loader for the (attempted) slot
      setInitState(prev => prev.map((v, i) => i === 0 ? false : v));
    }
  };

  const handleStopInference = async (index: number) => {
    const sid = streams[index].sid;
    try {
      await stopStream(sid);
    } catch { /* ignore */ }
    if (pollTimers.current[sid]) {
      window.clearInterval(pollTimers.current[sid]);
      delete pollTimers.current[sid];
    }
    setStreams(prev => {
      const next = [...prev];
      next[index] = { url: null, isInferencing: false, sid };
      return next;
    });
    setStats(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setInitState(prev => prev.map((v, i) => i === index ? false : v));
    setErrors(prev => prev.map((v, i) => i === index ? null : v));
  };

  const handleStopAllInference = async () => {
    const active = streams.filter(s => s.isInferencing).length > 0;
    if (!active) {
      alert('No active streams to stop.');
      return;
    }
    if (!window.confirm('Stop all active streams?')) return;

    // stop timers
    Object.keys(pollTimers.current).forEach(k => {
      window.clearInterval(pollTimers.current[Number(k)]);
    });
    pollTimers.current = {};

    // best-effort stop all
    for (const s of streams) {
      try { await stopStream(s.sid); } catch {}
    }

    setStreams([...Array(4)].map((_, i) => ({ url: null, isInferencing: false, sid: i + 1 })));
    setStats([null, null, null, null]);
    setInitState([false, false, false, false]);
    setErrors([null, null, null, null]);
  };

  /** ---------- SAVE SESSION (one record per active stream) ---------- **/
  const handleSaveSession = async () => {
    // collect active streams with stats
    const tasks: Promise<any>[] = [];
    streams.forEach((slot, i) => {
      const st = stats[i];
      if (!slot.isInferencing || !st) return;

      // map VehicleCount[] -> backend keys
      const map: Record<string, number> = { car: 0, van: 0, truck: 0, bus: 0 };
      st.breakdown.forEach(b => {
        const key = b.type.toLowerCase();
        if (key in map) map[key] = b.count;
      });
      const total = map.car + map.van + map.truck + map.bus;
      const source = slot.sourceLabel || `Stream ${slot.sid}`;

      tasks.push(saveSession({
        model: selectedModel || "Unknown Model",
        source,
        total,
        breakdown: {
          car: map.car,
          van: map.van,
          truck: map.truck,
          bus: map.bus,
        },
        avg_fps: Number(st.fps_proc || 0),
      }));
    });

    if (tasks.length === 0) {
      alert("No active streams to save.");
      return;
    }

    try {
      await Promise.all(tasks);
      alert("Session(s) saved to Dashboard.");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to save sessions.");
    }
  };

  const isStartDisabled = !selectedModel || (!videoUrlInput.trim() && !(fileInputRef.current?.files?.[0]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Configuration</h2>

          {/* Model select */}
          <div className="space-y-6">
            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Model</label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {models.map(m => (
                  <option key={m.file} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Source URL or Upload */}
            <div>
              <label htmlFor="video-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video / Stream Source</label>
              <input
                type="text"
                id="video-source"
                placeholder="RTSP / YouTube / HTTP / local absolute path"
                value={videoUrlInput}
                onChange={handleUrlInputChange}
                className="mt-1 block w-full pl-3 py-2 border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {localFileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected file: {localFileName}</p>}

              <div className="relative flex items-center my-2">
                <div className="flex-grow border-t border-slate-200 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-slate-200 dark:border-gray-600"></div>
              </div>

              <label htmlFor="file-upload" className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-bg cursor-pointer transition-colors">
                Upload Local Video
              </label>
              <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
            </div>

            {/* Sliders */}
            <div>
              <label htmlFor="confidence" className="block text-sm font-medium">Confidence: {confidence}%</label>
              <input type="range" id="confidence" min="0" max="100" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
            </div>
            <div>
              <label htmlFor="imageSize" className="block text-sm font-medium">Image Size: {imageSize}px</label>
              <input type="range" id="imageSize" min="320" max="1280" step="32" value={imageSize} onChange={(e) => setImageSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
            </div>
            <div>
              <label htmlFor="skipFrames" className="block text-sm font-medium">Infer every N frames: {Math.max(1, skipFrames || 1)}</label>
              <input type="range" id="skipFrames" min="0" max="5" value={skipFrames} onChange={(e) => setSkipFrames(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
            </div>

            {/* Actions */}
            <div className="mt-2 space-y-2">
              <button
                onClick={handleStartInference}
                disabled={isStartDisabled}
                className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                Start Inference
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveSession}
                  className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">
                  Save Session
                </button>
                <button
                  onClick={handleStopAllInference}
                  className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300">
                  Stop All
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Streams grid */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {streams.map((stream, i) => (
            <VideoStreamPlayer
              key={i}
              index={i}
              stream={stream}
              onStop={handleStopInference}
              overlay={stats[i]}
              isInitializing={initState[i]}
              error={errors[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
