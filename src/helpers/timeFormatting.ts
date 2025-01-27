export const formatElapsedTime = (firstAssignedAt: string): string => {
  try {
    const startTime = new Date(firstAssignedAt);
    const currentTime = new Date();

    if (isNaN(startTime.getTime())) {
      return '00h 00m';
    }

    const elapsed = Math.max(0, currentTime.getTime() - startTime.getTime());
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  } catch (error) {
    return '00h 00m';
  }
};
