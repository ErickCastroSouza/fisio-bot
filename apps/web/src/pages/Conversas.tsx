import { useState } from 'react'

import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import PatientInfo from '../components/PatientInfo'

type SelectedConversation = {
  id: string
  patient: {
    id: string
    name: string
    phone: string
  }
}

function Conversas() {
  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(null)

  return (
    <main className="flex min-w-0 flex-1">
      <ConversationList
        onSelectConversation={setSelectedConversation}
      />

      <ChatWindow
        conversation={selectedConversation}
      />

      <PatientInfo
        patient={selectedConversation?.patient ?? null}
      />
    </main>
  )
}

export default Conversas