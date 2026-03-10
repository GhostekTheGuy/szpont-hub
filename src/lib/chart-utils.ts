/**
 * Generate evenly-spaced "nice" tick values for a chart Y-axis.
 * Picks a round step size (1, 2, 2.5, 5 × 10^n) and returns
 * ticks from a rounded min to a rounded max.
 *
 * @param dataMin - minimum value in the dataset
 * @param dataMax - maximum value in the dataset
 * @param targetTickCount - desired number of ticks (default 5)
 */
export function getNiceYTicks(
  dataMin: number,
  dataMax: number,
  targetTickCount = 5,
): number[] {
  if (dataMin === dataMax) {
    // Flat line — show a single tick
    return [dataMin];
  }

  const range = dataMax - dataMin;
  const rawStep = range / (targetTickCount - 1);

  // Round step to a "nice" number
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(dataMin / niceStep) * niceStep;
  const niceMax = Math.ceil(dataMax / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + niceStep * 0.01; v += niceStep) {
    ticks.push(Math.round(v * 1e6) / 1e6); // avoid floating-point dust
  }

  return ticks;
}
