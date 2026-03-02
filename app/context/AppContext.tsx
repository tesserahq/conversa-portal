// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useHandleApiError } from '@/hooks/useHandleApiError'
// import { fetchApi, NodeENVType } from '@/libraries/fetch'
// import { IUser } from '@/resources/types'
// import { useAuth0 } from '@auth0/auth0-react'
// import { useNavigate } from 'react-router'
// import React, { useEffect, useState } from 'react'

// export interface IContextProps {
//   user: IUser | null
//   token: string | null
//   isLoading: boolean
// }

// const AppContext = React.createContext<IContextProps>({
//   token: null,
//   user: null,
//   isLoading: true,
// })

// interface IProviderProps {
//   children: React.ReactNode
//   identiesApiUrl: string
//   nodeEnv: NodeENVType
// }

// export function AppProvider({ children, identiesApiUrl, nodeEnv }: IProviderProps) {
//   const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
//   const [user, setUser] = useState<IUser | null>(null)
//   const navigate = useNavigate()
//   const [token, setToken] = useState<string>('')
//   const handleApiError = useHandleApiError()
//   const [loadingAuth0, setLoadingAuth0] = useState<boolean>(true)

//   const fetchToken = async () => {
//     try {
//       const token = await getAccessTokenSilently()
//       const user = await fetchApi(`${identiesApiUrl}/me`, token, nodeEnv)

//       setUser(user)
//       setToken(token)
//     } catch (error: any) {
//       handleApiError!(error)
//     } finally {
//       setLoadingAuth0(false)
//     }
//   }

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       navigate('/', { replace: true })
//       return
//     } else if (isAuthenticated) {
//       fetchToken()
//     }
//   }, [isLoading])

//   const contextPayload = React.useMemo(
//     () => ({
//       token: token || '',
//       user: user || null,
//       isLoading: loadingAuth0,
//     }),
//     [user, token]
//   )

//   return <AppContext.Provider value={contextPayload}>{children}</AppContext.Provider>
// }

// export const useApp = (): IContextProps => {
//   const context = React.useContext(AppContext)

//   if (!context) {
//     throw new Error('useCoreUI must be used within an IdentiesProvider')
//   }

//   return context
// }
