import { useQuery } from '@tanstack/vue-query'

import api from '@/lib/api'

import type { StopLossOptimizerResponse } from '@/types/stopLoss'

export const useStopLossOptimizer = () =>
  useQuery({
    gcTime: 20_000,
    staleTime: 20_000,
    queryKey: ['stop_loss_optimizer'],

    queryFn: async (): Promise<StopLossOptimizerResponse> => {
      const { data } = await api.get('stoploss-optimizooor', {
        params: {
          session_id: 'sess93205',
          uid: 'test_data',
        },
      })

      const sanitizedData = data.replace(/NaN/g, 'null')
      return JSON.parse(sanitizedData).data
    },
  })
