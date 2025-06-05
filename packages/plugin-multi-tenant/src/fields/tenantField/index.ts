import { type RelationshipField } from 'payload'
import { APIError } from 'payload'

import { defaults } from '../../defaults.js'
import { getCollectionIDType } from '../../utilities/getCollectionIDType.js'
import { getTenantFromCookie } from '../../utilities/getTenantFromCookie.js'

type Args = {
  access?: RelationshipField['access']
  debug?: boolean
  name: string
  tenantsCollectionSlug: string
  unique: boolean
  requireTenantId?: boolean
}

export const tenantField = ({
  name = defaults.tenantFieldName,
  access = undefined,
  debug,
  tenantsCollectionSlug = defaults.tenantCollectionSlug,
  unique,
  requireTenantId = true
}: Args): RelationshipField => ({
  name,
  type: 'relationship',
  access,
  admin: {
    allowCreate: false,
    allowEdit: false,
    components: {
      Field: {
        clientProps: {
          debug,
          unique,
        },
        path: '@payloadcms/plugin-multi-tenant/client#TenantField',
      },
    },
    disableListColumn: true,
    disableListFilter: true,
  },
  hasMany: false,
  hooks: {
    beforeChange: [
    ({ req, value }) => {
      const idType = getCollectionIDType({
        collectionSlug: tenantsCollectionSlug,
        payload: req.payload,
      })

      if (!value) {
        const tenantFromCookie = getTenantFromCookie(req.headers, idType)
        if (tenantFromCookie) {
          return tenantFromCookie
        }

        if (requireTenantId) {
          throw new APIError('You must select a tenant', 400, null, true)
        }
        return undefined
      }

      return idType === 'number' ? parseFloat(value) : value
    },
  ],
  },
  index: true,
  // @ts-expect-error translations are not typed for this plugin
  label: ({ t }) => t('plugin-multi-tenant:field-assignedTentant-label'),
  relationTo: tenantsCollectionSlug,
  unique,
})
