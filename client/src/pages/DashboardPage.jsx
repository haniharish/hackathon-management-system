import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ROLES, isAdministrator } from '../utils/rbac';
import { adminApi, hackathonApi, reviewApi, submissionApi, teamApi } from '../services/api';

const card = 'rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-lg backdrop-blur';
const input = 'mt-2 w-full rounded-xl border border-forest/15 bg-cream/50 px-3 py-2 outline-none focus:border-forest';
const button = 'rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50';
const subtleButton = 'rounded-full border border-forest/20 bg-white/70 px-4 py-2 text-sm font-semibold text-forest';
const scoreFields = ['innovation', 'technicalComplexity', 'uiUx', 'functionality', 'scalability', 'documentation', 'presentation'];

const getId = (value) => String(value?._id || value?.id || value || '');

const emptyHackathon = { title: '', description: '', theme: '', prizePool: '', venue: '', mode: 'online', registrationDeadline: '', startDate: '', endDate: '', maxTeamSize: 4 };

export default function DashboardPage() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [judges, setJudges] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignedHackathons, setAssignedHackathons] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [eventForm, setEventForm] = useState(emptyHackathon);
  const [editingId, setEditingId] = useState('');
  const [selectedJudgeIds, setSelectedJudgeIds] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [review, setReview] = useState({ feedback: '', comments: '', ...Object.fromEntries(scoreFields.map((field) => [field, 0])) });

  const isAdmin = isAdministrator(user);
  const isParticipant = user?.role === ROLES.PARTICIPANT;
  const isOrganizer = user?.role === ROLES.ORGANIZER || isAdmin;
  const isJudge = user?.role === ROLES.JUDGE;
  const ownHackathons = useMemo(() => hackathons.filter((item) => isAdmin || getId(item.organizer) === getId(user)), [hackathons, user]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const requests = [hackathonApi.list(isOrganizer && user?.role === ROLES.ORGANIZER ? { mine: true } : undefined), teamApi.list(isParticipant ? { mine: true } : undefined), submissionApi.list()];
      if (isOrganizer) requests.push(adminApi.judges());
      if (isAdmin) requests.push(adminApi.users(), adminApi.analytics());
      if (isJudge) requests.push(reviewApi.assignments());
      const results = await Promise.all(requests);
      setHackathons(results[0].data.hackathons || []);
      setTeams(results[1].data || []);
      setSubmissions(results[2].data || []);
      let index = 3;
      if (isOrganizer) setJudges(results[index++].data || []);
      if (isAdmin) {
        const usersResponse = results[index++].data;
        setUsers(usersResponse.users || []);
        setAnalytics(results[index++].data || null);
      }
      if (isJudge) {
        setAssignments(results[index]?.data?.submissions || []);
        setAssignedHackathons(results[index]?.data?.hackathons || []);
      }
    } catch (requestError) { setError(requestError.message || 'Unable to load your dashboard.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user?.id]);
  const run = async (action, success) => { setError(''); setNotice(''); try { await action(); setNotice(success); await load(); } catch (actionError) { setError(actionError.message || 'That action could not be completed.'); } };

  const saveHackathon = (event) => {
    event.preventDefault();
    const payload = { ...eventForm, maxTeamSize: Number(eventForm.maxTeamSize), status: 'open', registrationOpen: true };
    const save = async () => {
      setError(''); setNotice('');
      try {
        const response = editingId ? await hackathonApi.update(editingId, payload) : await hackathonApi.create(payload);
        const saved = response.data;
        setHackathons((current) => editingId ? current.map((item) => getId(item) === getId(saved) ? saved : item) : [saved, ...current]);
        setNotice(editingId ? 'Hackathon updated.' : 'Hackathon created and added to your dashboard.');
        setEventForm(emptyHackathon); setEditingId('');
        load();
      } catch (requestError) { setError(requestError.message || 'Unable to save hackathon.'); }
    };
    save();
  };
  const editHackathon = (item) => {
    setEditingId(item._id);
    setEventForm({ ...emptyHackathon, ...item, registrationDeadline: item.registrationDeadline?.slice(0, 10) || '', startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const toggleJudge = (eventId, judgeId) => setSelectedJudgeIds((current) => ({ ...current, [eventId]: (current[eventId] || []).includes(judgeId) ? current[eventId].filter((id) => id !== judgeId) : [...(current[eventId] || []), judgeId] }));
  const submitReview = (event) => {
    event.preventDefault();
    if (!selectedSubmission) return;
    run(() => reviewApi.submit({ submissionId: selectedSubmission._id, ...review }), 'Evaluation submitted. The submission score has been updated.');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
      <section className="rounded-[3rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-forest/60">{user?.role} workspace</p>
        <h1 className="mt-3 text-4xl font-semibold">Welcome back, {user?.name || 'Builder'}.</h1>
        <p className="mt-3 text-forest/70">{isParticipant && 'Discover events, build your team, and ship your project.'}{isOrganizer && 'Create exceptional events and guide every team from registration to results.'}{isJudge && 'Review your assigned projects with consistent, transparent scoring.'}</p>
      </section>
      {notice && <p className="rounded-2xl border border-forest/20 bg-cream/70 p-4 text-forest">{notice}</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
      {loading ? <div className={card}>Loading your workspace...</div> : <>
        {isParticipant && <ParticipantDashboard hackathons={hackathons} teams={teams} submissions={submissions} onRegister={(id) => run(() => hackathonApi.register(id), 'You are registered for this hackathon.')} />}
        {isAdmin && <AdministratorDashboard users={users} analytics={analytics} hackathons={hackathons} teams={teams} submissions={submissions} run={run} />}
        {isOrganizer && <OrganizerDashboard eventForm={eventForm} setEventForm={setEventForm} editingId={editingId} saveHackathon={saveHackathon} cancelEdit={() => { setEditingId(''); setEventForm(emptyHackathon); }} hackathons={ownHackathons} teams={teams} submissions={submissions} judges={judges} selectedJudgeIds={selectedJudgeIds} editHackathon={editHackathon} toggleJudge={toggleJudge} run={run} />}
        {isJudge && <JudgeDashboard assignments={assignments} assignedHackathons={assignedHackathons} selectedSubmission={selectedSubmission} setSelectedSubmission={setSelectedSubmission} review={review} setReview={setReview} submitReview={submitReview} />}
      </>}
    </motion.div>
  );
}


function AdministratorDashboard({ users, analytics, hackathons, teams, submissions, run }) {
  const roles = ['administrator', 'organizer', 'judge', 'participant'];
  const upcoming = hackathons.filter((item) => item.startDate && new Date(item.startDate) >= new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const organizers = users.filter((person) => person.role === ROLES.ORGANIZER).length;
  return <><section className={card}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">Platform control</h2><p className="mt-1 text-sm text-forest/70">Manage users, roles, access, and platform activity.</p></div><div className="flex gap-2 text-sm"><span className="rounded-full bg-cream/50 px-3 py-2">Users: {analytics?.users ?? users.length}</span><span className="rounded-full bg-cream/50 px-3 py-2">Hackathons: {analytics?.hackathons ?? 0}</span><span className="rounded-full bg-cream/50 px-3 py-2">Submissions: {analytics?.submissions ?? 0}</span></div></div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-forest/60"><tr><th className="pb-3">User</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead><tbody>{users.map((person) => <tr key={person._id || person.id} className="border-t border-forest/10"><td className="py-3"><b>{person.name}</b><div className="text-forest/60">{person.email}</div></td><td className="py-3"><select defaultValue={person.role} onChange={(e) => run(() => adminApi.updateRole(person._id || person.id, e.target.value), 'User role updated.')} className="rounded-lg border border-forest/20 bg-cream/50 px-2 py-1">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td className="py-3">{person.isActive === false ? 'Blocked' : 'Active'}</td><td className="py-3"><div className="flex gap-2"><button onClick={() => run(() => adminApi.blockUser(person._id || person.id), person.isActive === false ? 'User unblocked.' : 'User blocked.')} className={subtleButton}>{person.isActive === false ? 'Unblock' : 'Block'}</button><button onClick={() => run(() => adminApi.deleteUser(person._id || person.id), 'User deleted.')} className={subtleButton}>Delete</button></div></td></tr>)}</tbody></table></div>
  </section><section className={card}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-semibold">Platform overview</h2><p className="mt-1 text-sm text-forest/70">Full platform visibility and management controls.</p></div><div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-cream/50 px-3 py-2">All teams: {teams.length}</span><span className="rounded-full bg-cream/50 px-3 py-2">All submissions: {submissions.length}</span><span className="rounded-full bg-cream/50 px-3 py-2">Judges: {users.filter((person) => person.role === ROLES.JUDGE).length}</span><span className="rounded-full bg-cream/50 px-3 py-2">Organizers: {organizers}</span></div></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-forest/10 bg-cream/50 p-4"><h3 className="font-semibold">Upcoming events</h3><div className="mt-3 space-y-2">{upcoming.length ? upcoming.slice(0, 5).map((event) => <div key={event._id || event.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 p-3 text-sm"><span><b>{event.title}</b><span className="block text-forest/60">{event.venue || event.mode}</span></span><span className="text-forest/70">{new Date(event.startDate).toLocaleDateString()}</span></div>) : <p className="text-sm text-forest/70">No upcoming events.</p>}</div></div><div className="rounded-2xl border border-forest/10 bg-cream/50 p-4"><h3 className="font-semibold">Administrator capabilities</h3><ul className="mt-3 space-y-2 text-sm text-forest/70"><li>Manage every hackathon below: create, edit, open or close registration, assign judges, and delete.</li><li>Review all teams and submissions, approve teams, and publish winners.</li><li>Manage every user above, including judge and organizer roles, account blocking, and deletion.</li></ul></div></div>
  </section></>;
}
function ParticipantDashboard({ hackathons, teams, submissions, onRegister }) {
  return <>
    <div className="grid gap-4 md:grid-cols-3">
      <Stat label="Open hackathons" value={hackathons.filter((item) => item.registrationOpen).length} />
      <Stat label="My teams" value={teams.length} />
      <Stat label="My submissions" value={submissions.length} />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={card}><h2 className="text-2xl font-semibold">Explore & register</h2><div className="mt-5 space-y-3">{hackathons.map((item) => <div key={item._id} className="rounded-2xl border border-forest/10 bg-cream/50 p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-forest/70">{item.theme} · {item.venue}</p></div><button disabled={!item.registrationOpen} onClick={() => onRegister(item._id)} className={button}>{item.registrationOpen ? 'Register' : 'Closed'}</button></div></div>)}</div></section>
      <section className={card}><h2 className="text-2xl font-semibold">Build & submit</h2><p className="mt-3 text-forest/70">Create or manage a team, then submit and update your project before the event deadline.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/team" className={button}>Manage team</Link><Link to="/submission" className={button}>Submit project</Link><Link to="/profile" className={subtleButton}>Update profile</Link><Link to="/leaderboard" className={subtleButton}>View results</Link></div><div className="mt-6 space-y-2">{submissions.map((item) => <div key={item._id} className="rounded-xl bg-cream/50 p-3 text-sm"><b>{item.projectName}</b> <span className="text-forest/60">· {item.status}</span></div>)}</div></section>
    </div>
  </>;
}

function OrganizerDashboard({ eventForm, setEventForm, editingId, saveHackathon, cancelEdit, hackathons, teams, submissions, judges, selectedJudgeIds, editHackathon, toggleJudge, run }) {
  return <>
    <section className={card}><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">{editingId ? 'Edit hackathon' : 'Create hackathon'}</h2><p className="text-sm text-forest/70">Publishing opens registration by default.</p></div>{editingId && <button onClick={cancelEdit} className={subtleButton}>Cancel edit</button>}</div><form onSubmit={saveHackathon} className="mt-5 grid gap-3 md:grid-cols-2">{[['title','Title'],['theme','Theme'],['prizePool','Prize pool'],['venue','Venue'],['registrationDeadline','Registration deadline'],['startDate','Start date'],['endDate','End date'],['maxTeamSize','Max team size']].map(([field,label]) => <label key={field} className="text-sm font-medium">{label}<input required type={['registrationDeadline', 'startDate', 'endDate'].includes(field) ? 'date' : field === 'maxTeamSize' ? 'number' : 'text'} min={field === 'maxTeamSize' ? 1 : undefined} value={eventForm[field]} onChange={(e) => setEventForm({ ...eventForm, [field]: e.target.value })} className={input} /></label>)}<label className="text-sm font-medium">Mode<select value={eventForm.mode} onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })} className={input}><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select></label><label className="text-sm font-medium md:col-span-2">Description<textarea required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className={input} rows="3" /></label><button className={`${button} w-fit md:col-span-2`}>{editingId ? 'Save changes' : 'Create & open registration'}</button></form></section>
    <section className={card}><h2 className="text-2xl font-semibold">Manage your hackathons</h2><div className="mt-5 space-y-4">{hackathons.length === 0 && <p className="rounded-xl bg-cream/50 p-4 text-forest/70">Your hackathons will appear here after you create them.</p>}{hackathons.map((item) => <div key={item._id} className="rounded-2xl border border-forest/10 bg-cream/50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">{item.title}</h3><p className="text-sm text-forest/70">{item.status} · {item.participants?.length || 0} registrants</p></div><div className="flex flex-wrap gap-2"><button onClick={() => editHackathon(item)} className={subtleButton}>Edit</button><button onClick={() => run(() => hackathonApi.toggleRegistration(item._id, !item.registrationOpen), item.registrationOpen ? 'Registration closed.' : 'Registration opened.')} className={subtleButton}>{item.registrationOpen ? 'Close registration' : 'Open registration'}</button><button onClick={() => run(() => hackathonApi.remove(item._id), 'Hackathon deleted.')} className={subtleButton}>Delete</button></div></div><div className="mt-4 border-t border-forest/10 pt-4"><p className="text-sm font-semibold">Assign judges</p><div className="mt-2 flex flex-wrap gap-2">{judges.map((judge) => <label key={judge._id} className="rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-sm"><input type="checkbox" checked={(selectedJudgeIds[item._id] || item.assignedJudges?.map((j) => j._id || j) || []).includes(judge._id)} onChange={() => toggleJudge(item._id, judge._id)} className="mr-2" />{judge.name}</label>)}<button onClick={() => run(() => hackathonApi.assignJudges(item._id, selectedJudgeIds[item._id] || item.assignedJudges?.map((judge) => judge._id || judge) || []), 'Judges assigned.')} className={button}>Save judges</button></div></div></div>)}</div></section>
    <div className="grid gap-6 lg:grid-cols-2"><section className={card}><h2 className="text-2xl font-semibold">Registered teams</h2><div className="mt-4 space-y-3">{teams.map((team) => <div key={team._id} className="flex items-center justify-between rounded-xl bg-cream/50 p-3"><span><b>{team.name}</b> <span className="text-sm text-forest/60">· {team.status}</span></span><span className="flex gap-2"><button onClick={() => run(() => teamApi.approve(team._id), 'Team approved.')} className={subtleButton}>Approve</button><button onClick={() => run(() => teamApi.reject(team._id), 'Team rejected.')} className={subtleButton}>Reject</button></span></div>)}</div></section><section className={card}><h2 className="text-2xl font-semibold">Submissions & winners</h2><div className="mt-4 space-y-3">{submissions.map((submission) => <div key={submission._id} className="flex items-center justify-between rounded-xl bg-cream/50 p-3"><span><b>{submission.projectName}</b><span className="ml-2 text-sm text-forest/60">Score: {submission.score || 0}</span></span><button onClick={() => run(() => hackathonApi.publishWinners(submission.hackathon?._id || submission.hackathon, [submission._id]), 'Winner published and results announced.')} className={subtleButton}>Publish winner</button></div>)}</div></section></div>
  </>;
}

function JudgeDashboard({ assignments, assignedHackathons, selectedSubmission, setSelectedSubmission, review, setReview, submitReview }) {
  return <div className="grid gap-6 lg:grid-cols-2"><section className={card}><h2 className="text-2xl font-semibold">Assigned hackathons & projects</h2><div className="mt-3 flex flex-wrap gap-2">{assignedHackathons.map((event) => <span key={event._id} className="rounded-full bg-forest/10 px-3 py-1 text-sm">{event.title}</span>)}</div><p className="mt-3 text-forest/70">Open an assigned project to review its full details and submit a scored evaluation.</p><div className="mt-5 space-y-3">{assignments.length === 0 && <p className="rounded-xl bg-cream/50 p-4 text-forest/70">No projects have been submitted for your assigned hackathons yet.</p>}{assignments.map((item) => <button key={item._id} onClick={() => setSelectedSubmission(item)} className="w-full rounded-2xl border border-forest/10 bg-cream/50 p-4 text-left transition hover:bg-cream"><b>{item.projectName}</b><div className="mt-1 text-sm text-forest/60">{item.hackathon?.title} · {item.team?.name || 'Individual'}</div></button>)}</div></section><section className={card}>{selectedSubmission ? <form onSubmit={submitReview}><h2 className="text-2xl font-semibold">Evaluate {selectedSubmission.projectName}</h2><p className="mt-2 text-sm text-forest/70">{selectedSubmission.problemStatement}</p><div className="mt-3 rounded-xl bg-cream/50 p-3 text-sm text-forest/80"><b>Solution:</b> {selectedSubmission.solution}<br />{selectedSubmission.githubRepo && <><b>Repository:</b> <a className="underline" href={selectedSubmission.githubRepo} target="_blank" rel="noreferrer">Open repository</a></>}{selectedSubmission.liveDemo && <><br /><b>Demo:</b> <a className="underline" href={selectedSubmission.liveDemo} target="_blank" rel="noreferrer">Open live demo</a></>}</div><p className="mt-3 text-sm text-forest/70">Score each criterion from 0 to 10, then provide actionable feedback.</p><div className="mt-5 grid grid-cols-2 gap-3">{scoreFields.map((field) => <label key={field} className="text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}<input type="number" min="0" max="10" required value={review[field]} onChange={(e) => setReview({ ...review, [field]: Number(e.target.value) })} className={input} /></label>)}</div><label className="mt-3 block text-sm">Feedback<textarea required value={review.feedback} onChange={(e) => setReview({ ...review, feedback: e.target.value })} className={input} rows="3" /></label><label className="mt-3 block text-sm">Private comments (optional)<textarea value={review.comments} onChange={(e) => setReview({ ...review, comments: e.target.value })} className={input} rows="2" /></label><button className={`${button} mt-4`}>Submit evaluation</button></form> : <div><h2 className="text-2xl font-semibold">Choose a project</h2><p className="mt-3 text-forest/70">Select a project from your assignments to open its review form.</p></div>}</section></div>;
}
function Stat({ label, value }) { return <div className={card}><div className="text-3xl font-semibold">{value}</div><div className="mt-1 text-forest/70">{label}</div></div>; }