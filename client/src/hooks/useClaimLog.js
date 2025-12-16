import { useQuery } from '@tanstack/react-query';
import { claimLogApi } from '../services/api';

export const useClaimLog = (filters = {}) => {
  return useQuery({
    queryKey: ['claim-log', filters],
    queryFn: async () => {
      const response = await claimLogApi.getAll(filters);
      return response.data;
    }
  });
};
