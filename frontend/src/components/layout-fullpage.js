import React from 'react'

export default props => {
  return (
    <div className="vh-100 vw-100 flex flex-column">
      {props.children}
    </div>
  )
}
