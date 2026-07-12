export function dashboardController(repository) {
  return async (req, res) => {
    const [workspaceCount, documentCount, runCount, recentRuns] = await Promise.all([
      repository.count("workspaces", { userId: req.user.id }), repository.count("documents", { userId: req.user.id }),
      repository.count("workflow_runs", { userId: req.user.id }), repository.getAll("workflow_runs", { userId: req.user.id }, { created_at: -1 }),
    ]);
    res.json({ stats: { workspaceCount, documentCount, runCount }, recentRuns: recentRuns.slice(0, 5) });
  };
}
