import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { determineBadges } from "./badgeEngine.js";

export const recalculateReputation = async (userId) => {
  const aggregate = await Review.aggregate([
    { $match: { revieweeId: userId } },
    {
      $group: {
        _id: "$revieweeId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
        communication: { $avg: "$communication" },
        skillQuality: { $avg: "$skillQuality" },
        reliability: { $avg: "$reliability" },
        timeliness: { $avg: "$timeliness" },
        teamwork: { $avg: "$teamwork" },
        ghostFlags: {
          $sum: {
            $cond: [{ $eq: ["$flagGhosting", true] }, 1, 0]
          }
        }
      }
    }
  ]);

  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  const summary = aggregate[0] ?? {
    averageRating: 0,
    reviewCount: 0,
    communication: 0,
    skillQuality: 0,
    reliability: 0,
    timeliness: 0,
    teamwork: 0,
    ghostFlags: 0
  };

  const ghostPenalty = summary.ghostFlags >= 2 ? 0.3 : summary.ghostFlags ? 0.1 : 0;
  const normalizedScore = Math.max(0, Number(summary.averageRating.toFixed(1)) - ghostPenalty);
  const averageCategoryScores = {
    communication: Number((summary.communication ?? 0).toFixed(1)),
    skillQuality: Number((summary.skillQuality ?? 0).toFixed(1)),
    reliability: Number((summary.reliability ?? 0).toFixed(1)),
    timeliness: Number((summary.timeliness ?? 0).toFixed(1)),
    teamwork: Number((summary.teamwork ?? 0).toFixed(1))
  };

  user.reputationScore = Number(normalizedScore.toFixed(1));
  user.reviewCount = summary.reviewCount;
  user.badges = determineBadges({
    reputationScore: user.reputationScore,
    completedProjectsCount: user.completedProjectsCount,
    averageCategoryScores
  });
  await user.save();
};
