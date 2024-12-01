import axios from 'axios'

const api = axios.create({
  // baseURL: 'https://us-central1-tradestream-cloud.cloudfunctions.net',
  baseURL: 'http://localhost:3000',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // 'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
  },
})

export default api
