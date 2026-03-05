import { redirect } from 'react-router'

export async function loader({ params }: { params: { contextSourceID: string } }) {
  return redirect(`/context-sources/${params.contextSourceID}/overview`)
}

export default function ContextSourceDetailIndex() {
  return null
}
