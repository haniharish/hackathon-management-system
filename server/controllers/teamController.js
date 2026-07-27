import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import User from '../models/User.js';

export const listTeams = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;
    if (req.user.role === 'participant' && req.query.mine === 'true') filter.members = req.user._id;
    if (req.user.role === 'organizer') {
      const ownHackathons = await Hackathon.find({ organizer: req.user._id }).select('_id');
      filter.hackathon = { $in: ownHackathons.map((hackathon) => hackathon._id) };
    }
    const teams = await Team.find(filter)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('hackathon', 'title')
      .sort({ createdAt: -1 })
      .catch(() => []);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, hackathon: hackathonId } = req.body;
    if (!name?.trim() || !hackathonId) {
      return res.status(400).json({ message: 'Team name and hackathon are required' });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    const existing = await Team.findOne({
      hackathon: hackathonId,
      members: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You are already in a team for this hackathon' });
    }

    const team = await Team.create({
      name: name.trim(),
      hackathon: hackathonId,
      leader: req.user._id,
      members: [req.user._id],
      status: 'pending',
    });

    hackathon.teams.push(team._id);
    await hackathon.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.status === 'rejected') return res.status(400).json({ message: 'This team has been rejected' });
    if (team.members.some((member) => member.toString() === req.user._id.toString())) return res.status(400).json({ message: 'You are already on this team' });
    const existing = await Team.findOne({ hackathon: team.hackathon._id, members: req.user._id });
    if (existing) return res.status(400).json({ message: 'Leave your current team before joining another one' });
    if (team.members.length >= (team.hackathon.maxTeamSize || 4)) return res.status(400).json({ message: 'This team is full' });
    team.members.push(req.user._id);
    await team.save();
    res.json(team);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the team leader can edit team details' });
    if (req.body.name?.trim()) team.name = req.body.name.trim();
    await team.save();
    res.json(team);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
export const inviteMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can invite members' });
    }

    const { email } = req.body;
    const invitee = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!invitee) return res.status(404).json({ message: 'User not found with that email' });

    const maxSize = team.hackathon?.maxTeamSize || 4;
    if (team.members.length >= maxSize) {
      return res.status(400).json({ message: `Team is full (max ${maxSize})` });
    }

    if (team.members.some((m) => m.toString() === invitee._id.toString())) {
      return res.status(400).json({ message: 'User is already on the team' });
    }

    team.members.push(invitee._id);
    await team.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.leader.toString() === req.user._id.toString() && team.members.length > 1) {
      return res.status(400).json({ message: 'Transfer leadership before leaving' });
    }

    team.members = team.members.filter((m) => m.toString() !== req.user._id.toString());
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
      return res.json({ message: 'Team dissolved' });
    }
    await team.save();
    res.json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferLeadership = async (req, res) => {
  try {
    const { newLeaderId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the leader can transfer leadership' });
    }
    if (!team.members.some((m) => m.toString() === newLeaderId)) {
      return res.status(400).json({ message: 'New leader must be a team member' });
    }
    team.leader = newLeaderId;
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (req.user.role !== 'admin' && team.hackathon.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    team.status = 'approved';
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (req.user.role !== 'admin' && team.hackathon.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    team.status = 'rejected';
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
