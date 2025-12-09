import axios from 'axios'

const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async blogObject => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, blogObject, config)
  console.log('response of create service', response.data)
  return response.data
}

const deletion = async (id) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(`${baseUrl}/${id}`, config)
  console.log('response delete', response)
  return response.data
}

const update = async (id, blogObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.put(`/api/blogs/${id}`, blogObject, config)
  return response.data
}

export default { getAll, setToken, create, update, deletion }