export type User = {
  _id: string;
  name: string;
  email: string;
};

export type Contest = {
  _id: string;
  title: string;
  platform: string;
  category: string;
  description?: string;
  rules?: string;
  prizes?: string;
  website?: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: "upcoming" | "ongoing" | "completed";
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isBookmarked?: boolean;
  canEdit?: boolean;
  userSolution?: Solution | null;
};

export type Bookmark = {
  _id: string;
  user: string;
  contest: Contest;
  createdAt: string;
};

export type Solution = {
  _id: string;
  user: string;
  contest: Contest;
  link: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SolutionWithUser = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  contest: string;
  link: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
};
