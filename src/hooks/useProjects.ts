import { useState, useCallback } from 'react';
import { Project, CreateProjectRequest, ProgressUpdate } from '../types';
import { projectService } from '../services/projectService';

export const useProjects = (sessionId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects(sessionId);
      setProjects(fetchedProjects.map(p => ({ ...p, selected: false })));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const createProjects = useCallback(async (request: CreateProjectRequest) => {
    if (!sessionId) throw new Error('Not authenticated');

    try {
      setLoading(true);
      setProgress({ current: 0, total: request.count, status: 'Starting project creation...' });

      const response = await projectService.createProjects(sessionId, request, (update) => {
        setProgress(update);
      });

      // Refresh projects list
      await fetchProjects();
      
      return response;
    } catch (error) {
      console.error('Error creating projects:', error);
      throw error;
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [sessionId, fetchProjects]);

  const deleteProjects = useCallback(async (projectIds: string[]) => {
    if (!sessionId) throw new Error('Not authenticated');

    try {
      setLoading(true);
      setProgress({ current: 0, total: projectIds.length, status: 'Starting project deletion...' });

      await projectService.deleteProjects(sessionId, projectIds, (update) => {
        setProgress(update);
      });

      // Refresh projects list
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting projects:', error);
      throw error;
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [sessionId, fetchProjects]);

  const toggleProjectSelection = useCallback((projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.projectId === projectId ? { ...p, selected: !p.selected } : p
    ));
  }, []);

  const selectAllProjects = useCallback((selected: boolean) => {
    setProjects(prev => prev.map(p => ({ ...p, selected })));
  }, []);

  const getSelectedProjects = useCallback(() => {
    return projects.filter(p => p.selected);
  }, [projects]);

  return {
    projects,
    loading,
    progress,
    fetchProjects,
    createProjects,
    deleteProjects,
    toggleProjectSelection,
    selectAllProjects,
    getSelectedProjects
  };
};