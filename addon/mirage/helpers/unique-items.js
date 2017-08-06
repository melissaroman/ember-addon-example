export default function(items) {
  const visited = new Set();

  return items && items.filter ? items.filter(({ id }) => {
    const alreadyHas = visited.has(id);
    visited.add(id);
    return !alreadyHas;
  }) : items;
}
