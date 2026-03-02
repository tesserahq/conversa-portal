/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/loader/pre-loader'
import { Button } from '@shadcn/ui/button'
import { fetchApi } from '@/libraries/fetch'
import { useLoaderData, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { toast } from 'tessera-ui/components'
import { useApp } from 'tessera-ui'
import { useHandleApiError } from '@/hooks/useHandleApiError'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function SetupPage() {
  const navigate = useNavigate()
  const [setup, setSetup] = useState<{ setup_required: string; message: string }>()
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoadingSetup, setIsLoadingSetup] = useState<boolean>(false)
  const [isLoadingFetch, setIsLodingFetch] = useState<boolean>(true)

  const fetchData = async () => {
    try {
      const res = await fetchApi(`${apiUrl}/setup/system-status`, token!, nodeEnv)

      setSetup(res)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLodingFetch(false)
    }
  }

  const onSetup = async () => {
    setIsLoadingSetup(true)

    try {
      const res = await fetchApi(`${apiUrl}/setup`, token!, nodeEnv, {
        method: 'POST',
      })

      toast.success('System administrator setup completed successfully.')
      setSetup({ setup_required: 'false', message: res.message })
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoadingSetup(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      {isLoadingFetch && <AppPreloader />}
      {isLoadingSetup && (
        <div className="flex flex-col items-center gap-2">
          <div className="loading-spinner"></div>
          <p className="text-base font-medium">Processing...</p>
        </div>
      )}
      {!isLoadingSetup && !isLoadingFetch && (
        <>
          {setup?.setup_required ? (
            <div className="flex items-center justify-center gap-5">
              <img src="/images/image-progress.png" className="w-96" />
              <div className="max-w-[500px]">
                <h1 className="mb-2 text-3xl font-semibold dark:text-white">
                  System Administrator Setup Required
                </h1>
                <p className="mb-5 text-base opacity-70 dark:text-foreground">
                  To proceed, please complete the system administrator setup with click button
                  below.
                </p>
                <Button disabled={isLoadingSetup} onClick={onSetup}>
                  Set Up Now
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 text-center
                lg:max-w-[600px]">
              <img src="/images/image-complete.png" className="w-96" />
              <h1 className="text-3xl font-semibold dark:text-white">
                System Administrator Setup Complete
              </h1>
              <p className="mb-3 text-base opacity-70 dark:text-foreground">{setup?.message}</p>
              <Button disabled={isLoadingSetup} onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
