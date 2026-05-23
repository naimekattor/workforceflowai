import apiClient from "./axios";

export type JobStatus = "Open" | (string & {});

export interface Job {
  id: number;
  jobstatus: JobStatus | string;
  title: string;
  site_address: string;
  notes: string;
  customer: number;
  customer_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

export interface CreateJobPayload {
  jobstatus: JobStatus;
  title: string;
  site_address: string;
  notes: string;
  customer: number;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

type RawJobListResponse = JobListResponse | Job[];

export const getJobs = async (page = 1): Promise<JobListResponse> => {
  const response = await apiClient.get<RawJobListResponse>(`/api/jobs/list/?page=${page}`);

  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }

  return response.data;
};

export const createJob = async (data: CreateJobPayload): Promise<Job> => {
  const response = await apiClient.post<Job>("/api/jobs/create/", data);
  return response.data;
};

export const getJob = async (id: number | string): Promise<Job> => {
  const response = await apiClient.get<Job>(`/api/jobs/${id}/`);
  return response.data;
};

export const updateJob = async (id: number | string, data: UpdateJobPayload): Promise<Job> => {
  const response = await apiClient.patch<Job>(`/api/jobs/${id}/`, data);
  return response.data;
};

export const deleteJob = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/jobs/${id}/`);
};
