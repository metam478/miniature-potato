import axios from 'axios'
import { useQuery } from '@tanstack/vue-query'

const usePosts = () =>
  useQuery({
    gcTime: 20_000,
    staleTime: 20_000,
    queryKey: ['posts'],

    queryFn: async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts')
      return data
    },
  })

export default {
  usePosts,
}
