import { redirect } from 'react-router'

export async function loader({ params }: { params: { credentialID: string } }) {
  return redirect(`/credentials/${params.credentialID}/overview`)
}

export default function CredentialDetailIndex() {
  return null
}
