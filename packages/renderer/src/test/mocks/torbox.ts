import { http, HttpResponse } from 'msw'

const TORBOX_BASE_URL = 'https://api.torbox.app/v1/api'

const mockTorrent = {
  id: 12345,
  hash: 'abc123def456',
  name: 'Test Torrent',
  magnet: 'magnet:?xt=urn:btih:abc123def456',
  size: 1073741824,
  progress: 0.5,
  download_speed: 1048576,
  upload_speed: 524288,
  ratio: 0.5,
  download_state: 'downloading',
  eta: 3600,
  files: [
    {
      id: 1,
      name: 'test-file-1.mp4',
      size: 536870912,
    },
    {
      id: 2,
      name: 'test-file-2.mp4',
      size: 536870912,
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T01:00:00Z',
  download_finished: false,
  active: true,
}

const mockUser = {
  id: 1,
  email: 'test@example.com',
  plan: 1,
  total_downloaded: 10737418240,
  premium_expires_at: '2025-12-31T23:59:59Z',
  is_subscribed: true,
}

export const torboxHandlers = [
  http.post(
    `${TORBOX_BASE_URL}/torrents/createtorrent`,
    async ({ request }) => {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { success: false, detail: 'Unauthorized' },
          { status: 401 }
        )
      }

      const body = await request.json()
      if (
        !body ||
        (typeof body === 'object' && !('magnet' in body || 'url' in body))
      ) {
        return HttpResponse.json(
          { success: false, detail: 'Missing magnet or url' },
          { status: 400 }
        )
      }

      return HttpResponse.json({
        success: true,
        detail: 'Torrent created successfully',
        data: {
          torrent_id: mockTorrent.id,
          name: mockTorrent.name,
          hash: mockTorrent.hash,
        },
      })
    }
  ),

  http.get(`${TORBOX_BASE_URL}/torrents/mylist`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, detail: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      detail: 'Torrents retrieved',
      data: [mockTorrent],
    })
  }),

  http.post(
    `${TORBOX_BASE_URL}/torrents/controltorrent`,
    async ({ request }) => {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { success: false, detail: 'Unauthorized' },
          { status: 401 }
        )
      }

      return HttpResponse.json({
        success: true,
        detail: 'Operation successful',
      })
    }
  ),

  http.get(`${TORBOX_BASE_URL}/torrents/requestdl`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, detail: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const torrentId = url.searchParams.get('torrent_id')
    const fileId = url.searchParams.get('file_id')

    if (!torrentId || !fileId) {
      return HttpResponse.json(
        { success: false, detail: 'Missing parameters' },
        { status: 400 }
      )
    }

    return HttpResponse.text(
      `https://download.torbox.app/file/${torrentId}/${fileId}/test-file.mp4`
    )
  }),

  http.get(`${TORBOX_BASE_URL}/user/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, detail: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      detail: 'User info retrieved',
      data: mockUser,
    })
  }),
]
