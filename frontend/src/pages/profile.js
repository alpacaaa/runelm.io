import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import Link from '../components/link'

const Logout = ({ onClick }) => {
  return (
    <a href="#" onClick={e => e.preventDefault() & onClick()} className="link blue">
      Logout
    </a>
  )
}

const NotLoggedIn = props => {
  return (
    <div>
      <p>You are not logged in.</p>
      <p>
        <Link href="/">Create a snippet</Link>
      </p>
    </div>
  )
}

const Profile = ({ user, dispatch }) => {
  const snippets = user.snippets || []
  const logout = () => dispatch({ type: 'update-auth-token', token: null })
  const deleteSnippet = id => e => {
    e.preventDefault()
    if (!confirm(`Are you sure you want to delete snippet ${id}?`)) return

    dispatch({ type: 'delete-snippet', id })
  }

  return (
    <div>
      <p>Welcome @{user.id}. (<Logout onClick={logout} />)</p>
      {snippets.length && <ShowSnippets snippets={snippets} deleteSnippet={deleteSnippet} />}
    </div>
  )
}

const ShowSnippets = ({ snippets, deleteSnippet }) => {
  return (
    <div>
      <p>These are your snippets:</p>
      <ul className="list">
        {snippets.map(s =>
          <li key={s.id} className="pv2 profile-row">
            <Link href={`/c/` + s.id}>{s.title} – {s.id}</Link>
            <a href="#" className="link red ml3 f6 profile-delete" onClick={deleteSnippet(s.id)}>Delete</a>
          </li>
        )}
      </ul>
    </div>
  )
}

export default props => {
  const { user } = props.app
  const isLoggedIn = user && user.id

  return (
    <div className="flex flex-column vh-100">
      <Header />

      <div className="flex pa3 justify-around" style={{ flex: 1 }}>
        {isLoggedIn && <Profile user={user} dispatch={props.dispatch} />}
        {!isLoggedIn && <NotLoggedIn />}
      </div>

      <Footer />
    </div>
  )
}
