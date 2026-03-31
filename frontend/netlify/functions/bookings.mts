import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  return Netlify.env.get('JWT_SECRET') || 'onpurpose-jwt-secret-default'
}

function authenticate(req: Request): { id: string; name: string } | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(authHeader.slice(7), getJwtSecret()) as any
  } catch {
    return null
  }
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  const bookingStore = getStore({ name: 'bookings', consistency: 'strong' })

  const user = authenticate(req)
  if (!user) {
    return Response.json({ message: 'No token, authorization denied' }, { status: 401 })
  }

  // POST /api/bookings
  if (req.method === 'POST' && path === '/api/bookings') {
    const { serviceId, date, time } = await req.json()

    if (!serviceId || !date) {
      return Response.json({ message: 'Service ID and date are required' }, { status: 400 })
    }

    const serviceStore = getStore({ name: 'services', consistency: 'strong' })
    const service = await serviceStore.get(serviceId, { type: 'json' }) as any
    if (!service) {
      return Response.json({ message: 'Service not found' }, { status: 404 })
    }

    if (service.userId === user.id) {
      return Response.json({ message: 'Cannot book your own service' }, { status: 400 })
    }

    const bookingDate = new Date(`${date}T${time || '12:00:00'}`)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const booking = {
      id,
      userId: user.id,
      userName: user.name,
      serviceId,
      serviceTitle: service.title,
      servicePrice: service.price,
      date: bookingDate.toISOString(),
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }

    await bookingStore.setJSON(id, booking)
    return Response.json(booking, { status: 201 })
  }

  // GET /api/bookings/my-bookings
  if (req.method === 'GET' && path === '/api/bookings/my-bookings') {
    const { blobs } = await bookingStore.list()
    const bookings = []
    for (const blob of blobs) {
      const booking = await bookingStore.get(blob.key, { type: 'json' }) as any
      if (booking && booking.userId === user.id) {
        bookings.push(booking)
      }
    }
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return Response.json(bookings)
  }

  // GET /api/bookings/service/:serviceId
  if (req.method === 'GET' && path.startsWith('/api/bookings/service/')) {
    const serviceId = path.split('/').pop()!

    const serviceStore = getStore({ name: 'services', consistency: 'strong' })
    const service = await serviceStore.get(serviceId, { type: 'json' }) as any
    if (!service) {
      return Response.json({ message: 'Service not found' }, { status: 404 })
    }
    if (service.userId !== user.id) {
      return Response.json({ message: 'Not authorized to view these bookings' }, { status: 403 })
    }

    const { blobs } = await bookingStore.list()
    const bookings = []
    for (const blob of blobs) {
      const booking = await bookingStore.get(blob.key, { type: 'json' }) as any
      if (booking && booking.serviceId === serviceId) {
        bookings.push(booking)
      }
    }
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return Response.json(bookings)
  }

  // PUT /api/bookings/:id
  if (req.method === 'PUT' && path.startsWith('/api/bookings/') && !path.includes('/service/') && !path.includes('/my-bookings')) {
    const id = path.split('/').pop()!
    const { status } = await req.json()

    if (!['accepted', 'rejected', 'confirmed', 'completed'].includes(status)) {
      return Response.json({ message: 'Invalid status' }, { status: 400 })
    }

    const booking = await bookingStore.get(id, { type: 'json' }) as any
    if (!booking) {
      return Response.json({ message: 'Booking not found' }, { status: 404 })
    }

    const serviceStore = getStore({ name: 'services', consistency: 'strong' })
    const service = await serviceStore.get(booking.serviceId, { type: 'json' }) as any
    if (!service || service.userId !== user.id) {
      return Response.json({ message: 'Not authorized to update this booking' }, { status: 403 })
    }

    if (booking.status !== 'pending') {
      return Response.json({ message: `Booking has already been ${booking.status}` }, { status: 400 })
    }

    const updated = { ...booking, status, updatedAt: new Date().toISOString() }
    await bookingStore.setJSON(id, updated)
    return Response.json(updated)
  }

  return Response.json({ message: 'Not found' }, { status: 404 })
}

export const config: Config = {
  path: ['/api/bookings', '/api/bookings/*']
}
