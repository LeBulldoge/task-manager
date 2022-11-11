import { FormEvent, useState } from "react";

interface CompletionMenuProps<T> {
  hidden: boolean;
  source: T[];
  predicate?: (value: T, input: string) => boolean;
  sort?: (lhs: T, rhs: T, input: string) => number;
  itemToString: (value: T) => string;
  input: string;
  onComplete: (value: T) => void;
}

export function CompletionMenu<T>({
  hidden,
  source,
  predicate,
  sort,
  itemToString,
  input,
  onComplete,
}: CompletionMenuProps<T>) {
  if (hidden) return null;

  const items = input
    ? source
        .filter((item) =>
          predicate ? predicate(item, input) : itemToString(item) === input
        )
        .sort((lhs, rhs) => (sort ? sort(lhs, rhs, input) : 0))
    : source;

  if (items.length === 0) return null;
  const completedItem = items.find((item) => itemToString(item) === input);
  if (completedItem) {
    onComplete(completedItem);
    return null;
  }

  return (
    <div className="absolute bottom-10 max-h-24 w-full overflow-y-scroll rounded-xl bg-surface shadow">
      <ul className="h-fit w-full text-ellipsis rounded-xl bg-layer-3 py-2">
        {items.map((item, index) => {
          const str = itemToString(item);
          return (
            <li
              key={index}
              onClick={() => onComplete(item)}
              className="overflow-hidden text-ellipsis whitespace-nowrap px-2 focus:bg-layer-4 hover:bg-layer-4"
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
  extends Omit<CompletionMenuProps<T>, "input" | "hidden" | "onComplete"> {
  className: string;
  onSubmit: (e: FormEvent, item: T | null) => void;
}

export function CompletableInput<T>({
  source,
  predicate,
  sort,
  itemToString,
  className,
  onSubmit,
}: CompletableInputProps<T>) {
  const [input, setInput] = useState("");
  const [completedItem, setCompletedItem] = useState<T | null>(null);

  const [menuHidden, setMenuHidden] = useState(true);

  return (
    <div className="relative w-full">
      <CompletionMenu<T>
        hidden={menuHidden}
        source={source}
        predicate={predicate}
        sort={sort}
        itemToString={itemToString}
        input={input}
        onComplete={(value) => {
          setCompletedItem(value);
          setInput(itemToString(value));
        }}
      />
      <input
        className={className}
        type="text"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onFocus={() => setMenuHidden(false)}
        onBlur={() => setMenuHidden(true)}
        onSubmit={(e) => onSubmit(e, completedItem)}
      />
    </div>
  );
}
