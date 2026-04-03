export const calculateProfileCompletionScore = (user) => {
  const checks = [
    user.name,
    user.username,
    user.collegeName,
    user.department,
    user.year,
    user.semester,
    user.bio,
    user.githubUsername,
    user.availability,
    user.preferredCollaborationMode,
    user.skills?.length,
    user.preferredProjectTypes?.length,
    user.links?.length
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};
