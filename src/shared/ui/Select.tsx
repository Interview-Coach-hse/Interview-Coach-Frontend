import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/shared/lib/cn";

type Option = {
  label: string;
  value: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  error?: string;
  options: Option[];
};

function getInitialValue(
  options: Option[],
  value?: string | number | readonly string[] | undefined,
  defaultValue?: string | number | readonly string[] | undefined,
) {
  if (value !== undefined && value !== null) {
    return String(value);
  }

  if (defaultValue !== undefined && defaultValue !== null) {
    return String(defaultValue);
  }

  return options[0]?.value ?? "";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    options,
    className,
    disabled,
    id,
    name,
    onChange,
    onBlur,
    value,
    defaultValue,
    required,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;
  const buttonId = `${selectId}-button`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const isControlled = value !== undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(() => getInitialValue(options, value, defaultValue));
  const selectedIndex = useMemo(
    () => Math.max(options.findIndex((option) => option.value === selectedValue), 0),
    [options, selectedValue],
  );
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (isControlled) {
      setSelectedValue(String(value ?? ""));
      return;
    }

    const node = selectRef.current;

    if (!node) {
      return;
    }

    if (node.value !== selectedValue) {
      setSelectedValue(node.value);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const commitValue = (nextValue: string) => {
    setSelectedValue(nextValue);
    setIsOpen(false);

    const node = selectRef.current;

    if (!node) {
      return;
    }

    node.value = nextValue;
    onChange?.({
      target: node,
      currentTarget: node,
    } as ChangeEvent<HTMLSelectElement>);
    onBlur?.({
      target: node,
      currentTarget: node,
    } as FocusEvent<HTMLSelectElement>);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setHighlightedIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      const highlightedOption = options[highlightedIndex];

      if (highlightedOption) {
        commitValue(highlightedOption.value);
      }
    }
  };

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <div
        ref={wrapperRef}
        className="select-shell"
        onBlur={(event) => {
          if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
            setIsOpen(false);
          }
        }}
      >
        <select
          {...props}
          id={selectId}
          ref={(node) => {
            selectRef.current = node;

            if (typeof forwardedRef === "function") {
              forwardedRef(node);
            } else if (forwardedRef) {
              forwardedRef.current = node;
            }
          }}
          className="select-native"
          disabled={disabled}
          name={name}
          required={required}
          value={selectedValue}
          onChange={(event) => {
            setSelectedValue(event.target.value);
            onChange?.(event);
          }}
          onBlur={onBlur}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          id={buttonId}
          type="button"
          className={cn("input select-trigger", error && "input-error", isOpen && "select-trigger-open", className)}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => {
            setIsOpen((current) => !current);
            setHighlightedIndex(selectedIndex);
          }}
          onKeyDown={handleKeyDown}
        >
          <span className={cn("select-trigger-label", !selectedOption && "select-trigger-placeholder")}>
            {selectedOption?.label ?? "Выберите вариант"}
          </span>
          <span className="select-trigger-icon" aria-hidden="true">
            ▾
          </span>
        </button>
        {isOpen ? (
          <div className="select-dropdown" role="listbox" id={listboxId} aria-labelledby={buttonId}>
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  className={cn(
                    "select-option",
                    isSelected && "select-option-selected",
                    isHighlighted && "select-option-highlighted",
                  )}
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => commitValue(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected ? <span className="select-option-check">✓</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
});
