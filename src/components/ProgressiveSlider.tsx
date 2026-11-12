import React from 'react';

interface ProgressiveSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  displayValue?: string;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export const ProgressiveSlider: React.FC<ProgressiveSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  unit = '',
  displayValue,
  onChange,
  minLabel,
  maxLabel,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const trackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, #059669 0%, #059669 ${percentage}%, #d1fae5 ${percentage}%, #d1fae5 100%)`,
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-900 leading-tight">
          {label}
        </label>
        <span className="font-mono-tabular text-[13px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
          {displayValue ?? value.toFixed(step < 1 ? 1 : 0)}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={trackStyle}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="progressive-emerald-slider"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[11px] font-mono-tabular text-slate-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
