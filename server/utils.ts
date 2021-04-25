const BPM_THRESHOLD = 100;

const mongoBpmRange = (bpmRange: Array<number>) => [
  {bpm: {$gte: bpmRange[0]}},
  {bpm: {$lte: bpmRange[1]}},
];

export const bpmMatches = (bpm: Array<number>, isExtended: boolean=false) => {
  if (isExtended) {
    const ranges: Array<Array<number>> = [];
    if (bpm[0] < BPM_THRESHOLD) {
      ranges.push([bpm[0], Math.min(BPM_THRESHOLD, bpm[1])]);
    }
    if (bpm[1] > BPM_THRESHOLD) {
      ranges.push([Math.max(bpm[0], BPM_THRESHOLD), bpm[1]]);
    }

    const extendedRanges = ranges.map((range) => {
      if (range[0] < BPM_THRESHOLD) {
        return range.map(n => Math.round(n * 2));
      }
      return range.map(n => Math.round(n / 2));
    });

    const $or = ranges
      .concat(extendedRanges)
      .map((range) => ({
        $and: mongoBpmRange(range),
      }));

    return [{ $or }];
  } else {
    return mongoBpmRange(bpm);
  }
};
