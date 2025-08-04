import React from 'react'
import RegisterItself from './home/Register'
import AllContact from './getContectList/AllContect'
import MessageHistory from './message/GetAllMessages'
import AddContact from './addContact'

export default function App() {
  return (
    <div>
      {/* <RegisterItself></RegisterItself> */}
      {/* <div>Contects</div> */}
      <AllContact></AllContact>
      {/* <div>Get all messages</div>
      <MessageHistory></MessageHistory> */}
      {/* <AddContact></AddContact> */}
    </div>
  )
}
