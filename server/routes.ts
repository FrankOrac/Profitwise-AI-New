app.get("/api/social/traders/performance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const traders = await storage.getTopTraders();
      const tradersWithStats = await Promise.all(traders.map(async (trader) => {
        const stats = await storage.getTraderStats(trader.id);
        const isFollowing = await storage.isFollowing(userId, trader.id);
        return {
          ...trader,
          performance: stats.performance,
          winRate: stats.winRate,
          totalTrades: stats.totalTrades,
          followers: stats.followers,
          isFollowing
        };
      }));

      res.json(tradersWithStats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch traders" });
    }
  });

  app.post("/api/social/follow/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);

      if (followerId === traderId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      await storage.followTrader(followerId, traderId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to follow trader" });
    }
  });

  app.post("/api/social/unfollow/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);
      await storage.unfollowTrader(followerId, traderId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to unfollow trader" });
    }
  });