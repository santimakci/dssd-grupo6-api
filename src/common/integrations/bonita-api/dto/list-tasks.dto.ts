export interface ListTasksCloudDto {
  data: Tasks[];
  total: number;
  page: number;
  limit: number;
}

export interface Tasks {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  createdById: null;
  updatedById: null;
  deletedById: null;
  isActive: boolean;
  name: string;
  description: string;
  projectName: string;
  ongName: string;
  isTaken: boolean;
  startDate: Date;
  endDate: Date;
}
