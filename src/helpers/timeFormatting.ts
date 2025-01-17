export const formatElapsedTime = (firstAssignedAt: string): string => {
  const startTime = new Date(firstAssignedAt);
  const currentTime = new Date();

  const elapsed = currentTime.getTime() - startTime.getTime();

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
};
