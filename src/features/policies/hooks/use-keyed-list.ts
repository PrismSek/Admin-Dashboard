import { useId, useRef, useState } from "react";

export type KeyedListController<T> = {
  /** Stable per-row keys, index-aligned with the array passed in. */
  keys: readonly string[];
  append: (item: T) => void;
  remove: (index: number) => void;
};

/**
 * Stable, non-index React keys for a repeatable catalog-id / free-text array
 * field (`content.findingIds`, `clipboard.collectionIds`,
 * `removableMedia.exceptionIds`, `print.exceptionIds`,
 * `desktopApps.exceptionIds` — all `string[]` in `schemas.ts`).
 *
 * The coding standard for repeatable rule groups is `useFieldArray` with
 * stable `field.id` keys, never the array index. `react-hook-form`'s
 * `useFieldArray` cannot be used here, though: its `ArrayPath` type (see
 * `react-hook-form/dist/types/path/eager.d.ts`) only resolves for arrays of
 * *objects* — for a path pointing at `string[]` it resolves to `never`, so
 * `useFieldArray({ control, name: "content.findingIds" })` fails to compile
 * (verified directly with `tsc`: assigning the literal path name to `never`
 * errors) unless the call is forced past the type system with `as`, which
 * `docs/CODING_STANDARDS.md` §5 forbids.
 *
 * This hook reproduces the same guarantee — a row's identity survives an
 * append or a removal from the middle — without needing that cast: `append`
 * and `remove` mutate a parallel `keys` array in lockstep with the caller's
 * own array mutation, so `keys[i]` always names the same logical row as
 * `value[i]` through any sequence of appends/removals. The *values* stay
 * fully owned by `react-hook-form` (passed in as `value`/`onChange`, usually
 * from `useController`); only the React key identity is local.
 */
export function useKeyedList<T>(
  value: readonly T[],
  onChange: (next: T[]) => void,
): KeyedListController<T> {
  const idPrefix = useId();
  const sequenceRef = useRef(0);
  const [keys, setKeys] = useState<string[]>(() => value.map(() => makeKey()));

  function makeKey(): string {
    sequenceRef.current += 1;
    return `${idPrefix}-${sequenceRef.current}`;
  }

  function append(item: T) {
    onChange([...value, item]);
    setKeys((current) => [...current, makeKey()]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setKeys((current) => current.filter((_, i) => i !== index));
  }

  return { keys, append, remove };
}
