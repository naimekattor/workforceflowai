import apiClient from "./axios";

export type CollaboratorRole = "Admin" | "User";
export type CollaboratorWorkType =
  | "Employee"
  | "Sole_Trader"
  | "Limited_Company"
  | "Partnership";

export interface CollaboratorInvitePayload {
  owner: number;
  collaborator: number;
  work_type: CollaboratorWorkType;
  full_name: string;
  email: string;
  role: CollaboratorRole;
  phone_number: string;
  full_address: string;
  position: string;
  vat_registered: boolean;
  cis_registered: boolean;
  additional_notes: string;
}

export type CollaboratorUpdatePayload = Partial<CollaboratorInvitePayload>;

export interface Collaborator {
  id: number;
  owner: number;
  collaborator: number;
  work_type: CollaboratorWorkType | string;
  full_name: string;
  email: string;
  role: CollaboratorRole | string;
  phone_number?: string;
  full_address?: string;
  position?: string;
  vat_registered: boolean;
  cis_registered: boolean;
  additional_notes?: string;
}

export interface CollaboratorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Collaborator[];
}

export interface CollaboratorStats {
  total_collaborators: number;
  tax_registered: number;
  cis_registered: number;
}

export interface CollaboratorListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export const inviteCollaborator = async (
  data: CollaboratorInvitePayload
): Promise<Collaborator> => {
  const response = await apiClient.post<Collaborator>(
    "/api/collaborators/invite/",
    data
  );
  return response.data;
};

export const getCollaborators = async (
  params: CollaboratorListParams = {}
): Promise<CollaboratorListResponse> => {
  const response = await apiClient.get<CollaboratorListResponse>(
    "/api/collaborators/list/",
    { params }
  );
  return response.data;
};

export const getCollaboratorStats = async (): Promise<CollaboratorStats> => {
  const response = await apiClient.get<CollaboratorStats>(
    "/api/collaborators/stats/"
  );
  return response.data;
};

export const getCollaborator = async (
  id: number | string
): Promise<Collaborator> => {
  const response = await apiClient.get<Collaborator>(
    `/api/collaborators/${id}/`
  );
  return response.data;
};

export const updateCollaborator = async (
  id: number | string,
  data: CollaboratorUpdatePayload
): Promise<Collaborator> => {
  const response = await apiClient.patch<Collaborator>(
    `/api/collaborators/${id}/`,
    data
  );
  return response.data;
};

export const deleteCollaborator = async (
  id: number | string
): Promise<void> => {
  await apiClient.delete(`/api/collaborators/${id}/`);
};
