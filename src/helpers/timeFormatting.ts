export const formatElapsedTime = (
  firstAssignedAt: string,
  lastPowAt: string | null,
  isPaused: boolean,
  closedAt: string | null,
  accumulatedPauseSeconds: number
): string => {
  try {
    let startTime = new Date(firstAssignedAt);
    const currentTime = new Date();

    if (isNaN(startTime.getTime())) {
      return '00h 00m 00s';
    }

    if (!isPaused && lastPowAt) {
      startTime = new Date(lastPowAt); // Restart timer from lastPowAt
    }

    const isBountyComplete = !!closedAt && !!lastPowAt && isPaused;

    let stopTime: Date;

    if (isBountyComplete) {
      stopTime = new Date(closedAt as string);
    } else if (isPaused && lastPowAt) {
      stopTime = new Date(lastPowAt);
    } else {
      stopTime = currentTime;
    }

    const elapsedMilliseconds = Math.max(0, stopTime.getTime() - startTime.getTime());

    const effectiveElapsedSeconds = Math.max(
      0,
      Math.floor(elapsedMilliseconds / 1000) -
        (isPaused || !lastPowAt ? accumulatedPauseSeconds : 0)
    );

    const hours = Math.floor(effectiveElapsedSeconds / 3600);
    const minutes = Math.floor((effectiveElapsedSeconds % 3600) / 60);
    const seconds = effectiveElapsedSeconds % 60;

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds
      .toString()
      .padStart(2, '0')}s`;
  } catch (error) {
    return '00h 00m 00s';
  }
};
