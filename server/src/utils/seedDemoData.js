import { User } from "../models/User.js";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { ProjectSession } from "../models/ProjectSession.js";
import { Review } from "../models/Review.js";

export const demoUsers = [
  {
    name: "Aarav Mehta",
    email: "aarav.mehta@gmail.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Aarav",
    username: "aaravmehta",
    collegeName: "Campus Connect College",
    githubUsername: "aarav-builds",
    department: "Computer Science",
    year: "3rd Year",
    semester: "Semester 6",
    bio: "Full-stack builder who loves hackathons, rapid prototypes, and clean Express APIs.",
    skills: ["React", "Node.js", "MongoDB"],
    preferredProjectTypes: ["Hackathon", "Web App"],
    links: ["https://github.com/aarav-builds"],
    preferredCollaborationMode: "hybrid",
    availability: "Weekday evenings, 8 hours/week",
    reputationScore: 4.8,
    reviewCount: 5,
    completedProjectsCount: 2,
    badges: ["Highly Reliable", "Team Player"],
    profileCompletionScore: 100,
    completedProfile: true
  },
  {
    name: "Diya Sharma",
    email: "diya.sharma@gmail.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Diya",
    username: "diyasharma",
    collegeName: "Campus Connect College",
    githubUsername: "diya-designs",
    department: "Information Technology",
    year: "2nd Year",
    semester: "Semester 4",
    bio: "UI-focused teammate who turns rough ideas into polished interfaces and clear user flows.",
    skills: ["UI Design", "Figma", "React"],
    preferredProjectTypes: ["Design Sprint", "Web App"],
    links: ["https://github.com/diya-designs", "https://portfolio.diya.example"],
    preferredCollaborationMode: "online",
    availability: "Flexible weekends and afternoons",
    reputationScore: 4.9,
    reviewCount: 7,
    completedProjectsCount: 3,
    badges: ["Fast Responder", "Team Player"],
    profileCompletionScore: 100,
    completedProfile: true
  },
  {
    name: "Rohan Iyer",
    email: "rohan.iyer@gmail.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Rohan",
    username: "rohaniyer",
    collegeName: "Campus Connect College",
    githubUsername: "rohan-ml",
    department: "AI & Data Science",
    year: "4th Year",
    semester: "Semester 8",
    bio: "Machine learning enthusiast who enjoys recommendation systems, analytics dashboards, and Python tooling.",
    skills: ["Python", "Machine Learning", "Data Analysis"],
    preferredProjectTypes: ["Research", "Analytics", "Hackathon"],
    links: ["https://github.com/rohan-ml"],
    preferredCollaborationMode: "hybrid",
    availability: "Daily after 6 PM",
    reputationScore: 4.6,
    reviewCount: 3,
    completedProjectsCount: 1,
    badges: ["Top Developer"],
    profileCompletionScore: 100,
    completedProfile: true
  }
];

export const seedDemoData = async () => {
  await Notification.deleteMany({});
  await Message.deleteMany({});
  await Conversation.deleteMany({});
  await Review.deleteMany({});
  await ProjectSession.deleteMany({});
  await CollaborationRequest.deleteMany({});
  await User.deleteMany({
    email: { $in: demoUsers.map((user) => user.email) }
  });

  const users = await User.insertMany(demoUsers);
  const [aarav, diya, rohan] = users;

  const completedRequest = await CollaborationRequest.create({
    senderId: aarav._id,
    receiverId: diya._id,
    projectTitle: "Campus event website",
    description:
      "Need a front-end teammate to help finish a polished event portal with registrations and schedules.",
    requiredSkills: ["React", "UI Design"],
    requiredRole: "Frontend developer",
    projectType: "Hackathon",
    customMessage: "Would love your help polishing the interface and landing page.",
    urgency: "high",
    expectedDuration: "2 weeks",
    status: "accepted",
    statusHistory: [
      { status: "pending", changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) },
      { status: "accepted", changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) }
    ]
  });

  const pendingRequest = await CollaborationRequest.create({
    senderId: rohan._id,
    receiverId: diya._id,
    projectTitle: "Research dashboard",
    description:
      "Looking for a teammate to help build a dashboard that explains survey insights for our mini research project.",
    requiredSkills: ["Python", "Data Analysis"],
    requiredRole: "Analytics teammate",
    projectType: "Research",
    customMessage: "Need help turning raw survey data into a clear story.",
    urgency: "medium",
    expectedDuration: "10 days",
    status: "pending",
    statusHistory: [{ status: "pending", changedAt: new Date() }]
  });

  const session = await ProjectSession.create({
    requestId: completedRequest._id,
    memberIds: [aarav._id, diya._id],
    title: "Campus event website",
    description:
      "A polished event portal with registrations, schedules, and sponsor highlights for the annual campus fest.",
    timeline: "2 weeks",
    sharedResources: [{ label: "GitHub Repo", url: "https://github.com/example/campus-event" }],
    milestones: [
      { title: "Finalize landing page", isCompleted: true },
      { title: "Finish registration flow", isCompleted: true }
    ],
    status: "completed",
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    completedAt: new Date()
  });

  const conversation = await Conversation.create({
    memberIds: [aarav._id, diya._id],
    requestId: completedRequest._id,
    projectSessionId: session._id,
    lastMessageAt: new Date()
  });

  await Message.insertMany([
    {
      conversationId: conversation._id,
      projectSessionId: session._id,
      senderId: aarav._id,
      content: "Shared the repo and initial API routes.",
      type: "text",
      readBy: [aarav._id, diya._id]
    },
    {
      conversationId: conversation._id,
      projectSessionId: session._id,
      senderId: diya._id,
      content: "https://figma.com/file/demo-campus-event",
      type: "link",
      isPinned: true,
      readBy: [aarav._id, diya._id]
    }
  ]);

  await Review.insertMany([
    {
      projectSessionId: session._id,
      reviewerId: aarav._id,
      revieweeId: diya._id,
      rating: 5,
      communication: 5,
      skillQuality: 5,
      reliability: 5,
      timeliness: 5,
      teamwork: 5,
      comment: "Excellent communicator and very reliable with UI delivery."
    },
    {
      projectSessionId: session._id,
      reviewerId: diya._id,
      revieweeId: aarav._id,
      rating: 5,
      communication: 5,
      skillQuality: 5,
      reliability: 5,
      timeliness: 4,
      teamwork: 5,
      comment: "Kept the project organized and delivered backend work quickly."
    }
  ]);

  return {
    usersCreated: users.length,
    requestsCreated: 2,
    completedProjectId: session._id.toString(),
    pendingRequestId: pendingRequest._id.toString()
  };
};
