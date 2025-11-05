import { http, HttpResponse } from 'msw'

const REALDEBRID_BASE_URL = 'https://api.real-debrid.com/rest/1.0'

const mockTorrent = {
  id: 'ABC123DEF456',
  filename: 'Test Torrent',
  hash: 'abc123def456',
  bytes: 1073741824,
  progress: 50,
  status: 'downloading',
  added: '2024-01-01T00:00:00Z',
  speed: 1048576,
  seeders: 10,
  files: [
    {
      id: 1,
      path: '/test-file-1.mp4',
      bytes: 536870912,
      selected: 1,
    },
    {
      id: 2,
      path: '/test-file-2.mp4',
      bytes: 536870912,
      selected: 1,
    },
  ],
  links: ['https://real-debrid.com/d/link1', 'https://real-debrid.com/d/link2'],
}

const mockUser = {
  id: 12345,
  username: 'testuser',
  email: 'test@example.com',
  points: 1000,
  locale: 'en',
  avatar: 'https://example.com/avatar.jpg',
  type: 'premium',
  premium: 1,
  expiration: '2025-12-31T23:59:59Z',
}

export const realDebridHandlers = [
  http.post(
    `${REALDEBRID_BASE_URL}/torrents/addMagnet`,
    async ({ request }) => {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: 'Unauthorized', error_code: 401 },
          { status: 401 }
        )
      }

      const formData = await request.formData()
      const magnet = formData.get('magnet')
      if (!magnet) {
        return HttpResponse.json(
          { error: 'Missing magnet parameter', error_code: 400 },
          { status: 400 }
        )
      }

      return HttpResponse.json({
        id: mockTorrent.id,
        uri: `https://api.real-debrid.com/rest/1.0/torrents/info/${mockTorrent.id}`,
      })
    }
  ),

  http.get(
    `${REALDEBRID_BASE_URL}/torrents/info/:id`,
    ({ request, params }) => {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: 'Unauthorized', error_code: 401 },
          { status: 401 }
        )
      }

      const { id } = params
      if (id !== mockTorrent.id) {
        return HttpResponse.json(
          { error: 'Torrent not found', error_code: 404 },
          { status: 404 }
        )
      }

      return HttpResponse.json(mockTorrent)
    }
  ),

  http.post(
    `${REALDEBRID_BASE_URL}/torrents/selectFiles/:id`,
    async ({ request }) => {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { error: 'Unauthorized', error_code: 401 },
          { status: 401 }
        )
      }

      return HttpResponse.json({}, { status: 204 })
    }
  ),

  http.delete(`${REALDEBRID_BASE_URL}/torrents/delete/:id`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized', error_code: 401 },
        { status: 401 }
      )
    }

    return HttpResponse.json({}, { status: 204 })
  }),

  http.post(`${REALDEBRID_BASE_URL}/unrestrict/link`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized', error_code: 401 },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const link = formData.get('link')
    if (!link) {
      return HttpResponse.json(
        { error: 'Missing link parameter', error_code: 400 },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      id: 'UNREST123',
      filename: 'test-file.mp4',
      mimeType: 'video/mp4',
      filesize: 536870912,
      link: link,
      host: 'real-debrid.com',
      chunks: 4,
      download: `https://download.real-debrid.com/file123/test-file.mp4`,
      streamable: 1,
    })
  }),

  http.get(`${REALDEBRID_BASE_URL}/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized', error_code: 401 },
        { status: 401 }
      )
    }

    return HttpResponse.json(mockUser)
  }),
]
