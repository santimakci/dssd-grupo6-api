export interface ListTasksCloudDto {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface Task {
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
  projectId: string;
  collaboratorId: null;
  isFinished: boolean;
  startDate: Date;
  endDate: Date;
}
