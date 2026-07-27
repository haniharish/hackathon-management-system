import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Review from '../models/Review.js';
import Registration from '../models/Registration.js';
import { hashPassword } from '../utils/auth.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in .env before seeding.');
    process.exit(1);
  }

  await Promise.all([
    User.deleteMany({}),
    Hackathon.deleteMany({}),
    Team.deleteMany({}),
    Submission.deleteMany({}),
    Review.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  const password = await hashPassword('password123');

  const [admin, organizer, judge, p1, p2] = await User.create([
    { name: 'Admin User', email: 'admin@hackverse.com', password, role: 'admin' },
    { name: 'Sarah Organizer', email: 'organizer@hackverse.com', password, role: 'organizer' },
    { name: 'James Judge', email: 'judge@hackverse.com', password, role: 'judge' },
    { name: 'Alex Builder', email: 'participant@hackverse.com', password, role: 'participant' },
    { name: 'Mina Patel', email: 'demo@hackverse.com', password, role: 'participant' },
  ]);

  const hackathon = await Hackathon.create({
    title: 'GreenTech Sprint 2026',
    description: 'Build climate-positive products that create measurable real-world impact.',
    theme: 'Climate Innovation',
    mode: 'online',
    isOnline: true,
    venue: 'Virtual',
    prizePool: '$20,000',
    registrationDeadline: new Date('2026-09-10'),
    startDate: new Date('2026-09-14'),
    endDate: new Date('2026-12-31'),
    maxTeamSize: 4,
    rules: ['Respect all participants', 'Submit before deadline', 'Original work only'],
    judgingCriteria: ['Innovation', 'Impact', 'Execution', 'Scalability'],
    organizer: organizer._id,
    status: 'open',
    registrationOpen: true,
    assignedJudges: [judge._id],
    participants: [p1._id, p2._id],
    tags: ['climate', 'sustainability'],
  });

  await Registration.create([
    { hackathon: hackathon._id, user: p1._id },
    { hackathon: hackathon._id, user: p2._id },
  ]);

  const team = await Team.create({
    name: 'EcoNova',
    hackathon: hackathon._id,
    leader: p1._id,
    members: [p1._id, p2._id],
    status: 'approved',
  });

  hackathon.teams.push(team._id);
  await hackathon.save();

  const submission = await Submission.create({
    projectName: 'NovaGrid AI',
    problemStatement: 'Grid energy forecasting lacked accessible insight.',
    solution: 'Multimodal forecasting platform for smart grid planning.',
    description: 'Clean energy optimization with ML pipelines.',
    githubRepo: 'https://github.com/example/novagrid',
    liveDemo: 'https://example.com',
    techStack: ['React', 'Node.js', 'Python'],
    status: 'reviewed',
    hackathon: hackathon._id,
    team: team._id,
    submittedBy: p1._id,
    score: 82,
  });

  await Review.create({
    submission: submission._id,
    judge: judge._id,
    innovation: 9,
    technicalComplexity: 8,
    uiUx: 8,
    functionality: 9,
    scalability: 8,
    documentation: 7,
    presentation: 8,
    feedback: 'Strong impact and polished demo.',
  });

  console.log('Seed complete. Demo accounts (password: password123):');
  console.log('  admin@hackverse.com (admin)');
  console.log('  organizer@hackverse.com (organizer)');
  console.log('  judge@hackverse.com (judge)');
  console.log('  participant@hackverse.com (participant)');
  console.log('  demo@hackverse.com (participant)');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
