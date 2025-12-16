import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../services/api';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clientsApi.getAll();
      return response.data;
    }
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const response = await clientsApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await clientsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await clientsApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await clientsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

export const useNextJobNumber = (clientId) => {
  return useQuery({
    queryKey: ['clients', clientId, 'next-job-number'],
    queryFn: async () => {
      const response = await clientsApi.getNextJobNumber(clientId);
      return response.data;
    },
    enabled: !!clientId
  });
};

export const useClaimJobNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await clientsApi.claimJobNumber(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['claim-log'] });
    }
  });
};
