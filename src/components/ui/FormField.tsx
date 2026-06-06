import type { InputHTMLAttributes } from 'react';
import { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '../icons/Icons';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, className = '', id, ...props }: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col gap-sm ${className}`}>
      <label htmlFor={inputId} className="text-base font-medium text-text-main">
        {label}
      </label>
      <input
        id={inputId}
        className={`h-input px-lg border rounded-md bg-bg-input text-text-main outline-none transition duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)] w-full placeholder:text-text-placeholder placeholder:font-medium ${
          error ? 'border-danger' : 'border-border-input'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Choose from Drop-down',
  disabled,
  error,
}: SelectFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-base font-medium text-text-main">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`h-input px-lg border rounded-md bg-bg-input outline-none transition duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)] w-full appearance-none pr-[40px] cursor-pointer font-medium ${
            error ? 'border-danger' : 'border-border-input'
          } ${value ? 'text-text-main' : 'text-text-placeholder'}`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-text-main">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
          <IconChevronDown />
        </span>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

export function TextAreaField({ label, placeholder, value, onChange, rows = 4 }: TextAreaFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-base font-medium text-text-main">
        {label}
      </label>
      <textarea
        id={id}
        className="w-full border border-border-input rounded-md bg-bg-input text-text-main outline-none transition duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)] h-auto min-h-[120px] p-md px-lg resize-y placeholder:text-text-placeholder placeholder:font-medium"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ label, name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="text-base font-medium text-text-main">{label}</span>
      <div className="flex items-center gap-2xl min-h-input">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-sm text-base font-medium cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="peer absolute opacity-0 w-0 h-0"
            />
            <span className="w-[20px] h-[20px] border-2 border-[#818cf8] rounded-full relative shrink-0 peer-checked:border-primary peer-checked:after:content-[''] peer-checked:after:absolute peer-checked:after:top-1/2 peer-checked:after:left-1/2 peer-checked:after:-translate-x-1/2 peer-checked:after:-translate-y-1/2 peer-checked:after:w-[10px] peer-checked:after:h-[10px] peer-checked:after:bg-primary peer-checked:after:rounded-full transition-colors" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function NumberStepper({ label, value, onChange }: NumberStepperProps) {
  return (
    <div className="flex flex-col gap-sm flex-1">
      <span className="text-sm font-medium text-text-main">{label}</span>
      <div className="flex items-stretch border border-border-input rounded-md overflow-hidden h-input bg-bg-input">
        <input
          type="number"
          className="flex-1 border-none px-md text-base font-medium outline-none min-w-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="flex flex-col border-l border-border-input">
          <button
            type="button"
            className="flex-1 px-3 text-[8px] text-text-subtle bg-transparent hover:bg-bg-tab-active hover:text-primary transition"
            onClick={() => onChange(value + 1)}
            aria-label="Increase"
          >
            ▲
          </button>
          <button
            type="button"
            className="flex-1 px-3 text-[8px] text-text-subtle bg-transparent hover:bg-bg-tab-active hover:text-primary transition border-t border-border-input"
            onClick={() => onChange(value - 1)}
            aria-label="Decrease"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-sm text-base font-medium cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute opacity-0 w-0 h-0"
      />
      <span className="w-[20px] h-[20px] border-2 border-border-input rounded-sm shrink-0 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-checked:after:content-['✓'] peer-checked:after:text-white peer-checked:after:text-xs peer-checked:after:font-bold transition-colors" />
      {label}
    </label>
  );
}

interface MultiSelectFieldProps {
  label: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function MultiSelectField({
  label,
  selectedValues = [],
  onChange,
  options = [],
  placeholder = 'Select options',
  disabled = false,
  error,
}: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (disabled) return;
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedValues.filter((v) => v !== value));
  };

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  return (
    <div className="flex flex-col gap-sm relative" ref={containerRef}>
      <label className="text-base font-medium text-text-main">{label}</label>
      <div className="relative flex flex-col">
        <div
          className={`min-h-input px-lg py-xs border rounded-md bg-bg-input flex items-center flex-wrap gap-sm cursor-pointer relative transition duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(89,136,239,0.15)] ${
            error ? 'border-danger' : 'border-border-input'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-text-placeholder font-medium select-none">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-xs">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-xs bg-bg-tab-active border border-primary/20 text-primary-dark px-sm py-[2px] rounded-sm text-xs font-medium"
                >
                  {opt.label}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center bg-transparent text-text-subtle border-none font-bold cursor-pointer p-0 w-[14px] h-[14px] rounded-full hover:bg-danger-bg hover:text-danger transition-colors"
                    onClick={(e) => handleRemove(opt.value, e)}
                    disabled={disabled}
                    aria-label={`Remove ${opt.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <span className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
            <IconChevronDown />
          </span>
        </div>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-bg-card border border-border rounded-md shadow-md max-h-[200px] overflow-y-auto z-50 py-sm">
            {options.length === 0 ? (
              <div className="px-lg py-sm text-text-subtle text-sm">No options available</div>
            ) : (
              options.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    className={`flex items-center gap-md px-lg py-sm text-sm text-text-main cursor-pointer select-none transition-colors duration-150 hover:bg-bg-page ${
                      isChecked ? 'bg-primary-light text-primary-dark font-medium' : ''
                    }`}
                    onClick={() => handleToggle(opt.value)}
                  >
                    <span
                      className={`w-4 h-4 border rounded-sm flex items-center justify-center text-[10px] text-white transition-colors ${
                        isChecked ? 'bg-primary border-primary' : 'border-border-input bg-transparent'
                      }`}
                    >
                      {isChecked && '✓'}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
