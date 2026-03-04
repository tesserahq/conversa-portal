import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useCredential } from '@/resources/hooks/credentials/use-credential'

export function loader({ params }: { params: { credentialID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.credentialID }
}

export default function CredentialDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/credentials/${params.credentialID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: credential,
    isLoading,
    error,
  } = useCredential(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv },
    params.credentialID as string,
    { enabled: !!token }
  )

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const credentialID = params.credentialID

  if (!isLoading && (error || !credential)) {
    return (
      <EmptyContent
        title="Credential Not Found"
        image="/images/empty-credential.png"
        description={`We can't find credential with ID ${params.credentialID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/credentials')}>Back to Credentials</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !credentialID}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
