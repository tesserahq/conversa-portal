import { useAuth0 } from '@auth0/auth0-react'
import { useLoaderData } from 'react-router'
import { useEffect } from 'react'

export function loader() {
  const hostUrl = process.env.HOST_URL

  return { hostUrl }
}

export default function Logout() {
  const { hostUrl } = useLoaderData<typeof loader>()
  const { logout } = useAuth0()

  useEffect(() => {
    logout({ logoutParams: { returnTo: hostUrl } })
  }, [])

  return <></>
}
