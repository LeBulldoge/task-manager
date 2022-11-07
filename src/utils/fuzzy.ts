export function fuzzySearch(
  source: string,
  input: string,
  isCaseSensitive = false
) {
  if (!input) return -1;

  let distance = 0;
  if (!isCaseSensitive) {
    source = source.toLowerCase();
    input = input.toLowerCase();
  }

  if (source.includes(input)) return 1;

  const lhs = source.split("");
  const rhs = input.split("");

  for (let index = 0; index < lhs.length; index++) {
    const cl = lhs.at(index);
    const cr = rhs.at(index);

    if (!cl) return -1;
    if (!cr) {
      rhs.push(cl);
      distance += 1;
      continue;
    }

    if (cl !== cr) {
      if (cl === rhs.at(index + 1)) {
        if (cr == lhs.at(index + 1)) {
          rhs.splice(index, 2, cl, lhs.at(index + 1) ?? "");
        } else {
          rhs.splice(index, 1);
        }
      } else if (lhs.includes(cl, index)) {
        rhs.splice(index, 0, cl);
      } else if (cr === lhs.at(index + 1)) {
        rhs.splice(index + 1, 0, cl);
      } else {
        rhs.splice(index, 1, cl);
      }

      distance += 1;
    }
  }

  const difference = Math.abs(source.length - input.length);
  const res =
    1 - Math.max(distance, difference) / Math.min(source.length, input.length);

  return res;
}
