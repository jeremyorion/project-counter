import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../services/api';

export const useProjects = (filters = {}) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const response = await projectsApi.getAll(filters);
      return response.data;
    }
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await projectsApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await projectsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await projectsApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await projectsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: async () => {
      const response = await projectsApi.getStats();
      return response.data;
    }
  });
};

export const useRecentProjects = (limit = 5) => {
  return useQuery({
    queryKey: ['projects', 'recent', limit],
    queryFn: async () => {
      const response = await projectsApi.getRecent(limit);
      return response.data;
    }
  });
};
