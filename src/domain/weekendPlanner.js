export const calcUserType = (answers) => {
  const scores = {};
  answers.forEach((answer) => {
    answer.types.forEach((type) => {
      scores[type] = (scores[type] || 0) + 1;
    });
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
};

export const selectWeekendPlans = (plans, type, region) => {
  const newStructurePlans = plans.filter((plan) => plan.spots?.[0]?.anchor);
  const match = newStructurePlans.filter((plan) => plan.region === region && plan.types.includes(type));
  const other = newStructurePlans.filter((plan) => plan.region === region && !plan.types.includes(type));

  return [
    ...match.sort(() => Math.random() - 0.5).slice(0, 2),
    other.sort(() => Math.random() - 0.5)[0],
  ].filter(Boolean);
};
