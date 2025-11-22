export const formatDateTime = (value: any) => {
  const d = new Date(value);

  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `on ${date} at ${time}`;
};
