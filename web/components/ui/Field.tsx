type BaseFieldProps = {
  label: string;
};

export function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: BaseFieldProps & {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-black text-muted">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: BaseFieldProps & {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-black text-muted">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-28 w-full resize-none rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
      />
    </div>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-black text-muted">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition focus:border-blue"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
