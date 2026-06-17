import { Slider } from './ui/slider';
import { Select } from './ui/select';
import { Copy } from 'lucide-react';

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
}

interface ControlPanelProps {
  confidenceThreshold: number;
  overlapThreshold: number;
  opacityThreshold: number;
  labelDisplayMode: string;
  detections: Detection[];
  onConfidenceChange: (value: number[]) => void;
  onOverlapChange: (value: number[]) => void;
  onOpacityChange: (value: number[]) => void;
  onLabelModeChange: (value: string) => void;
}

export function ControlPanel({
  confidenceThreshold,
  overlapThreshold,
  opacityThreshold,
  labelDisplayMode,
  detections,
  onConfidenceChange,
  onOverlapChange,
  onOpacityChange,
  onLabelModeChange,
}: ControlPanelProps) {
  const predictionsJson = JSON.stringify(
    {
      predictions: detections.map(d => ({
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        confidence: d.confidence,
        class: d.class,
        class_id: d.class_id,
        detection_id: d.detection_id,
      }))
    },
    null,
    2
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(predictionsJson);
  };

  return (
    <div className="space-y-6">
      {/* Confidence Threshold */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-white font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            Confidence Threshold:
          </label>
          <span className="text-orange-500 font-bold">{confidenceThreshold}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">0%</span>
          <Slider
            value={[confidenceThreshold]}
            onValueChange={onConfidenceChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-neutral-500">100%</span>
        </div>
      </div>

      {/* Overlap Threshold */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-white font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            Overlap Threshold:
          </label>
          <span className="text-orange-500 font-bold">{overlapThreshold}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">0%</span>
          <Slider
            value={[overlapThreshold]}
            onValueChange={onOverlapChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-neutral-500">100%</span>
        </div>
      </div>

      {/* Opacity Threshold */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-white font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            Opacity Threshold:
          </label>
          <span className="text-orange-500 font-bold">{opacityThreshold}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">0%</span>
          <Slider
            value={[opacityThreshold]}
            onValueChange={onOpacityChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-neutral-500">100%</span>
        </div>
      </div>

      {/* Label Display Mode */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <label className="text-white font-semibold mb-4 block flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
          Label Display Mode:
        </label>
        <select
          value={labelDisplayMode}
          onChange={(e) => onLabelModeChange(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="Draw Confidence">Draw Confidence</option>
          <option value="Draw Class">Draw Class</option>
          <option value="Hide Labels">Hide Labels</option>
        </select>
      </div>

      {/* JSON Output */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <button
            onClick={copyToClipboard}
            className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2 text-sm"
          >
            Copy
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <pre className="bg-black/40 rounded-lg p-4 text-xs text-neutral-300 overflow-auto max-h-96 border border-neutral-800 font-mono scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
          {predictionsJson}
        </pre>
      </div>
    </div>
  );
}
