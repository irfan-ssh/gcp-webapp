import axios from 'axios';
import { Project, CreateProjectRequest, CreateProjectResponse, ProgressUpdate } from '../types';

const API_BASE_URL = 'http://localhost:3001';

class ProjectService {
  async getProjects(sessionId: string): Promise<Project[]> {
    const response = await axios.get(`${API_BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    });
    return response.data.projects;
  }

  async createProjects(
    sessionId: string, 
    request: CreateProjectRequest,
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<CreateProjectResponse> {
    // Simulate progress updates for demo
    if (onProgress) {
      for (let i = 0; i < request.count; i++) {
        onProgress({
          current: i,
          total: request.count,
          status: `Creating project ${i + 1} of ${request.count}...`,
          projectId: `${request.prefix}-${Date.now()}-${i + 1}`
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const response = await axios.post(`${API_BASE_URL}/api/projects/bulk`, request, {
      headers: { Authorization: `Bearer ${sessionId}` }
    });
    return response.data;
  }

  async deleteProjects(
    sessionId: string, 
    projectIds: string[],
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<void> {
    // Simulate progress updates for demo
    if (onProgress) {
      for (let i = 0; i < projectIds.length; i++) {
        onProgress({
          current: i,
          total: projectIds.length,
          status: `Deleting project ${projectIds[i]}...`,
          projectId: projectIds[i]
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    await axios.post(`${API_BASE_URL}/api/projects/bulk-delete`, 
      { projectIds }, 
      { headers: { Authorization: `Bearer ${sessionId}` } }
    );
  }

  async downloadServiceAccountKeys(sessionId: string, projectIds: string[]): Promise<Blob> {
    const response = await axios.post(`${API_BASE_URL}/api/projects/download-keys`, 
      { projectIds }, 
      { 
        headers: { Authorization: `Bearer ${sessionId}` },
        responseType: 'blob'
      }
    );
    return response.data;
  }
}

export const projectService = new ProjectService();