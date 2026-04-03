export const determineBadges = ({ reputationScore, completedProjectsCount, averageCategoryScores }) => {
  const badges = [];

  if (reputationScore >= 4.5 && completedProjectsCount >= 3) {
    badges.push("Highly Reliable");
  }

  if (averageCategoryScores.communication >= 4.5) {
    badges.push("Fast Responder");
  }

  if (averageCategoryScores.skillQuality >= 4.5) {
    badges.push("Top Developer");
  }

  if (averageCategoryScores.teamwork >= 4.5) {
    badges.push("Team Player");
  }

  if (completedProjectsCount >= 5) {
    badges.push("Hackathon Pro");
  }

  return badges;
};
