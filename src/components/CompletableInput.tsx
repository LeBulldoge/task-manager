import { useState } from "react";

interface CompletionMenuProps<T> {
  source: T[];
  predicate?: (value: T, input: string) => boolean;
  sort?: (lhs: T, rhs: T, input: string) => number;
  itemToString: (value: T) => string;
  input: string;
  onComplete: (value: string) => void;
}

export function CompletionMenu<T>({
  source,
  predicate,
  sort,
  itemToString,
  input,
  onComplete,
}: CompletionMenuProps<T>) {
  if (!input) return null;

  const items = source
    .filter((item) =>
      predicate ? predicate(item, input) : itemToString(item) === input
    )
    .sort((lhs, rhs) => (sort ? sort(lhs, rhs, input) : 0));

  if (items.length === 0 || items.some((item) => itemToString(item) === input))
    return null;

  return (
    <div className="absolute bottom-10 max-h-24 w-full overflow-y-scroll rounded-xl bg-surface shadow">
      <ul className="h-fit w-full text-ellipsis rounded-xl bg-layer-3 py-2">
        {items.map((item) => {
          const str = itemToString(item);
          return (
            <li
              onClick={() => onComplete(str)}
              className="overflow-hidden text-ellipsis whitespace-nowrap px-2 hover:bg-layer-4"
            >
              {str}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface CompletableInputProps<T>
  extends Omit<CompletionMenuProps<T>, "input" | "onComplete"> {
  className: string;
}

export function CompletableInput<T>({
  source,
  predicate,
  sort,
  itemToString,
  className,
}: CompletableInputProps<T>) {
  const [input, setInput] = useState("");

  return (
    <div className="relative w-full">
      <CompletionMenu<T>
        source={source}
        predicate={predicate}
        sort={sort}
        itemToString={itemToString}
        input={input}
        onComplete={setInput}
      />
      <input
        className={className}
        type="text"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
      />
    </div>
  );
}
