
export const createApi = (endpoint) => {
  let headers = {}
  return {
    setHeaders(new_headers) {
      headers = new_headers
    },
    fetch(query, variables = {}) {
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          query, variables
        })
      }
      return fetch(endpoint, options)
      .then(res => res.json())
    }
  }
}
