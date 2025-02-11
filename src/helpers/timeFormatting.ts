export const formatElapsedTime = (
  firstAssignedAt: string,
  lastPowAt: string | null,
  isPaused: boolean
): string => {
  try {
    const startTime = new Date(firstAssignedAt);
    const currentTime = new Date();

    if (isNaN(startTime.getTime())) {
      return '00h 00m 00s';
    }

    const stopTime = lastPowAt || isPaused ? new Date(lastPowAt || currentTime) : currentTime;

    const elapsed = Math.max(0, stopTime.getTime() - startTime.getTime());
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds
      .toString()
      .padStart(2, '0')}s`;
  } catch (error) {
    return '00h 00m 00s';
  }
};
