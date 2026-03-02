import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { ServiceAccountType } from './service-account.type'
import { IQueryConfig, IQueryParams } from '..'

const SERVICE_ACCOUNTS_ENDPOINT = '/service-accounts'

/**
 * Get paginated service accounts
 */
export async function getServiceAccounts(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<ServiceAccountType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const serviceAccounts = await fetchApi(`${apiUrl}${SERVICE_ACCOUNTS_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return serviceAccounts as IPaging<ServiceAccountType>
}
