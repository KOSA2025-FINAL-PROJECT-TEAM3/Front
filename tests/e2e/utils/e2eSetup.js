export const setE2EAuth = async (page, { customerRole, role, userId, user: providedUser, token } = {}) => {
  const resolvedCustomerRole = providedUser?.customerRole || customerRole || role || 'SENIOR'
  const resolvedUser = {
    id: providedUser?.id ?? userId ?? 1,
    name: providedUser?.name ?? 'E2E 사용자',
    email: providedUser?.email ?? 'e2e@example.com',
    customerRole: resolvedCustomerRole,
    userRole: providedUser?.userRole ?? 'ROLE_USER',
  }
  const resolvedToken = token || 'e2e-token'

  const persisted = {
    state: {
      user: resolvedUser,
      token: resolvedToken,
      refreshToken: null,
      userRole: resolvedUser.userRole,
      customerRole: resolvedUser.customerRole,
    },
    version: 0,
  }

  await page.addInitScript(
    ({ persistedState, rawUser, customerRoleValue }) => {
      localStorage.setItem('amapill-auth-storage-v2', JSON.stringify(persistedState))
      localStorage.setItem('amapill_token', persistedState.state.token)
      localStorage.setItem('amapill_user', JSON.stringify(rawUser))
      localStorage.setItem('amapill_role', customerRoleValue)
    },
    { persistedState: persisted, rawUser: resolvedUser, customerRoleValue: resolvedUser.customerRole },
  )

  await page.addInitScript(() => {
    function MockEventSource() {
      this.readyState = 1
      this.onopen = null
      this.onerror = null
      setTimeout(() => this.onopen && this.onopen(), 0)
    }

    MockEventSource.OPEN = 1
    MockEventSource.prototype.close = function close() {}
    MockEventSource.prototype.addEventListener = function addEventListener() {}

    window.EventSource = MockEventSource
  })
}

export const setE2EAuthState = async (page, options) => setE2EAuth(page, options)

export const mockApi = async (page) => {
  const calls = []
  const unhandled = []

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
    const method = request.method()
    const resourceType = request.resourceType()

    const isApiRequest =
      (resourceType === 'xhr' || resourceType === 'fetch' || resourceType === 'eventsource') &&
      normalizedPath.startsWith('/api/')
    if (!isApiRequest) {
      return route.continue()
    }

    calls.push({
      method,
      path: normalizedPath,
      resourceType,
    })

    if (resourceType === 'eventsource' && normalizedPath === '/api/notifications/subscribe') {
      return route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: ': ok\n\n',
      })
    }

    if (method === 'GET' && normalizedPath === '/api/notifications') {
      return route.fulfill({
        status: 200,
        json: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          last: true,
        },
      })
    }

    if (method === 'GET' && normalizedPath === '/api/notifications/unread-count') {
      return route.fulfill({ status: 200, json: 0 })
    }

    if (method === 'GET' && normalizedPath === '/api/medications') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/medications/today') {
      return route.fulfill({ status: 200, json: { schedules: [] } })
    }

    if (method === 'GET' && normalizedPath === '/api/medications/logs') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/family/groups') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/family/invites') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/appointments') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/prescriptions') {
      return route.fulfill({
        status: 200,
        json: [
          {
            id: 1,
            pharmacyName: '테스트 약국',
            hospitalName: '테스트 병원',
            startDate: '2025-12-01',
            endDate: '2025-12-31',
            medicationCount: 1,
            active: true,
          },
        ],
      })
    }

    if (method === 'GET') {
      const prescriptionDetailMatch = normalizedPath.match(/^\/api\/prescriptions\/(\d+)$/)
      if (prescriptionDetailMatch) {
        const id = Number(prescriptionDetailMatch[1])
        return route.fulfill({
          status: 200,
          json: {
            id,
            pharmacyName: '테스트 약국',
            hospitalName: '테스트 병원',
            startDate: '2025-12-01',
            endDate: '2025-12-31',
            intakeTimes: ['08:00'],
            medications: [
              {
                id: 100,
                name: '테스트약',
                dosage: '1',
              },
            ],
            paymentAmount: null,
            notes: '',
          },
        })
      }
    }

    unhandled.push({ method, path: normalizedPath, resourceType })
    return route.fulfill({ status: 200, json: {} })
  })

  return { calls, unhandled }
}
