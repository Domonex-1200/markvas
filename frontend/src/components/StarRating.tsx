import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 18 }: Props): JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`transition ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={star <= value ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
          />
        </button>
      ))}
    </div>
  );
}
