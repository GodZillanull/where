export const DEFAULT_YORIMICHI_INPUT = {
  homeStation: 'omika',
  time: 60,
  range: 'walk',
  zure: 'safe',
  ngQueue: false,
  ngNoisy: false,
  ngReserve: false,
  ngCash: false,
};

export const selectYorimichiSpots = (input, yorimichiData) => {
  const { homeStation, time, range: _range, zure, ngQueue, ngNoisy, ngCash } = input;
  let spots = [...yorimichiData.spots];

  if (homeStation === 'omika') {
    spots = spots.filter((spot) => spot.homeStation === 'omika');
  } else {
    spots = spots.filter((spot) => !spot.homeStation);
  }

  if (zure === 'safe') {
    spots = spots.filter((spot) => spot.zure === 'safe');
  } else if (zure === 'change') {
    spots = spots.filter((spot) => spot.zure === 'safe' || spot.zure === 'change');
  }

  const maxTime = time;
  spots = spots.filter((spot) => (spot.walkFromStation + spot.stayTime) <= maxTime + 15);

  if (ngQueue) spots = spots.filter((spot) => spot.crowdLevel <= 2);
  if (ngNoisy) spots = spots.filter((spot) => spot.noiseLevel <= 1);
  if (ngCash) spots = spots.filter((spot) => !spot.cashOnly);

  const safeSpots = spots.filter((spot) => spot.zure === 'safe').sort(() => Math.random() - 0.5);
  const changeSpots = spots.filter((spot) => spot.zure === 'change').sort(() => Math.random() - 0.5);
  const adventureSpots = spots.filter((spot) => spot.zure === 'adventure').sort(() => Math.random() - 0.5);

  const result = [];
  if (safeSpots[0]) result.push(safeSpots[0]);
  if (changeSpots[0]) result.push(changeSpots[0]);
  if (adventureSpots[0]) result.push(adventureSpots[0]);

  const remaining = [...safeSpots.slice(1), ...changeSpots.slice(1), ...adventureSpots.slice(1)]
    .sort(() => Math.random() - 0.5);
  while (result.length < 3 && remaining.length > 0) {
    result.push(remaining.shift());
  }

  return result;
};
