import bcrypt from 'bcryptjs';

const demoPasswordHash = await bcrypt.hash('password123', 10);

const fallbackUsers = [
  {
    _id: 'demo-admin',
    name: 'Mina Patel',
    email: 'demo@hackverse.com',
    password: demoPasswordHash,
    role: 'admin',
    avatar: '',
    isActive: true,
    emailVerified: true,
    bio: 'Platform visionary',
    company: 'HackVerse',
    location: 'Remote',
  },
];

const fallbackHackathons = [
  {
    _id: 'hack-1',
    title: 'GreenTech Sprint',
    description: 'Build climate-positive products that create measurable real-world impact.',
    theme: 'Climate Innovation',
    banner: '',
    prizePool: '$20,000',
    venue: 'Online',
    isOnline: true,
    registrationDeadline: '2026-09-10T00:00:00.000Z',
    startDate: '2026-09-14T00:00:00.000Z',
    endDate: '2026-09-16T00:00:00.000Z',
    maxTeamSize: 4,
    rules: ['Respect all participants', 'Submit before deadline'],
    judgingCriteria: ['Innovation', 'Impact', 'Execution'],
    organizer: 'demo-admin',
    status: 'open',
    participants: ['demo-admin'],
    teams: [],
    winners: [],
    tags: ['climate', 'sustainability'],
  },
  {
    _id: 'hack-2',
    title: 'AI Builders Jam',
    description: 'Prototype bold AI experiences across health, productivity, and education.',
    theme: 'Applied Intelligence',
    banner: '',
    prizePool: '$15,000',
    venue: 'Hybrid',
    isOnline: false,
    registrationDeadline: '2026-10-01T00:00:00.000Z',
    startDate: '2026-10-02T00:00:00.000Z',
    endDate: '2026-10-04T00:00:00.000Z',
    maxTeamSize: 5,
    rules: ['Teams of up to 5', 'Be open source'],
    judgingCriteria: ['Technical Complexity', 'User Experience', 'Scalability'],
    organizer: 'demo-admin',
    status: 'open',
    participants: ['demo-admin'],
    teams: [],
    winners: [],
    tags: ['ai', 'productivity'],
  },
];

const fallbackSubmissions = [
  {
    _id: 'sub-1',
    projectName: 'NovaGrid AI',
    problemStatement: 'Grid energy forecasting lacked accessible insight.',
    solution: 'Created a multimodal forecasting platform for smart grid planning.',
    description: 'Award-winning solution for clean energy optimization.',
    githubRepo: 'https://github.com/example/novagrid',
    liveDemo: 'https://example.com',
    techStack: ['React', 'Node.js', 'Python'],
    presentationPdf: '',
    screenshots: [],
    demoVideo: '',
    status: 'reviewed',
    hackathon: 'hack-1',
    team: null,
    submittedBy: 'demo-admin',
    score: 96,
  },
];

const fallbackTeams = [];

export const getFallbackUsers = () => fallbackUsers.map((user) => ({ ...user }));
export const findFallbackUserByEmail = (email) =>
  fallbackUsers.find((user) => user.email === email.toLowerCase());
export const emailExistsInFallback = (email) => Boolean(findFallbackUserByEmail(email));
export const findFallbackUserById = (id) => fallbackUsers.find((user) => user._id === id);
export const addFallbackUser = async (userData) => {
  const newUser = {
    _id: `user-${fallbackUsers.length + 1}`,
    name: userData.name,
    email: userData.email.toLowerCase(),
    role: userData.role || 'participant',
    avatar: '',
    isActive: true,
    emailVerified: false,
    bio: '',
    company: '',
    location: '',
    password: await bcrypt.hash(userData.password, 10),
  };
  fallbackUsers.push(newUser);
  return newUser;
};
export const getFallbackHackathons = () => fallbackHackathons.map((hackathon) => ({ ...hackathon }));
export const getFallbackSubmissions = () => fallbackSubmissions.map((submission) => ({ ...submission }));
export const getFallbackTeams = () => fallbackTeams.map((team) => ({ ...team }));
export const getFallbackStats = () => ({ hackathons: fallbackHackathons.length, submissions: fallbackSubmissions.length, users: fallbackUsers.length });
