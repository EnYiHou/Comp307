import express from "express";
import Team from "../models/Team.js";
import requireAuth from "../middleware/authMiddleware.js";

// Main: Ronald Zhang

const router = express.Router();

// Get teams the user is in
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const teams = await Team.find({ members: req.user.id })
      .populate("leader", "name email")
      .populate("members", "name email");
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// Search teams
router.get("/search", requireAuth, async (req, res, next) => {
  try {
    const { query } = req.query;
    let filter = { members: { $ne: req.user.id } }; // Teams user is NOT in
    
    if (query) {
      filter.course = { $regex: query, $options: "i" };
    }

    const teams = await Team.find(filter)
      .populate("leader", "name email")
      .populate("members", "name email");
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// Create a team
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, course, description, size } = req.body;
    const team = await Team.create({
      name,
      course,
      description,
      size,
      leader: req.user.id,
      members: [req.user.id],
    });
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// Join a team directly
router.post("/:teamId/join", requireAuth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
    
    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already in team" });
    }
    
    if (team.members.length >= team.size) {
      return res.status(400).json({ message: "Team is full" });
    }

    team.members.push(req.user.id);
    
    // Remove from applicants if they were previously there
    if (team.applicants && team.applicants.includes(req.user.id)) {
      team.applicants = team.applicants.filter(id => id.toString() !== req.user.id);
    }

    await team.save();
    res.json({ message: "Joined successfully" });
  } catch (error) {
    next(error);
  }
});

// Leave a team
router.post("/:teamId/leave", requireAuth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter((id) => id.toString() !== req.user.id);
    
    // If leader leaves, pick a new one or delete? For now, just remove.
    if (team.leader.toString() === req.user.id) {
      if (team.members.length > 0) {
        team.leader = team.members[0];
      } else {
        await Team.findByIdAndDelete(req.params.teamId);
        return res.json({ message: "Team deleted as last member left" });
      }
    }

    await team.save();
    res.json({ message: "Left team successfully" });
  } catch (error) {
    next(error);
  }
});

// Delete a team (Leader only)
router.delete("/:teamId", requireAuth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the leader can delete the team" });
    }

    await Team.findByIdAndDelete(req.params.teamId);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Remove a member (Leader only)
router.post("/:teamId/remove/:userId", requireAuth, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the leader can remove members" });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: "Leader cannot remove themselves. Use leave instead." });
    }

    team.members = team.members.filter((id) => id.toString() !== req.params.userId);
    await team.save();
    
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
