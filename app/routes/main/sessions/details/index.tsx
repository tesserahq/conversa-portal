import { redirect } from 'react-router'

export async function loader({ params }: { params: { sessionID: string } }) {
  return redirect(`/sessions/${params.sessionID}/overview`)
}

export default function SessionDetailIndex() {
  return null
}
