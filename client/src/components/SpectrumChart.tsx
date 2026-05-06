import { AxisScores, PolicyAxis } from '@political-dialogue/shared';
import { AXIS_TITLES } from '@political-dialogue/shared';

interface AxisRowProps {
  axis: PolicyAxis;
  score: number;
  compareScore?: number;
  showLabels?: boolean;
}

function AxisRow({ axis, score, compareScore, showLabels = true }: AxisRowProps) {
  const title = AXIS_TITLES[axis];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">{Math.round(score)}/100</span>
      </div>
      <div className="relative h-4 rounded-full bg-gradient-to-r from-blue-200 via-purple-100 to-red-200">
        {/* User's dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-600 border-2 border-white shadow-md transition-all"
          style={{ left: `calc(${score}% - 8px)` }}
          title={`Your score: ${Math.round(score)}`}
        />
        {/* Compare dot (match partner) */}
        {compareScore !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md transition-all"
            style={{ left: `calc(${compareScore}% - 8px)` }}
            title={`Their score: ${Math.round(compareScore)}`}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progressive</span>
          <span>Conservative</span>
        </div>
      )}
    </div>
  );
}

interface SpectrumChartProps {
  scores: AxisScores;
  compareScores?: AxisScores;
  showLabels?: boolean;
}

const AXES: PolicyAxis[] = ['economic', 'social', 'government', 'environment', 'foreign'];

export function SpectrumChart({ scores, compareScores, showLabels = true }: SpectrumChartProps) {
  return (
    <div className="space-y-5">
      {compareScores && (
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-600 inline-block" /> You
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Your match
          </span>
        </div>
      )}
      {AXES.map((axis) => (
        <AxisRow
          key={axis}
          axis={axis}
          score={scores[axis]}
          compareScore={compareScores?.[axis]}
          showLabels={showLabels}
        />
      ))}
    </div>
  );
}
