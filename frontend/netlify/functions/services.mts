import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  return Netlify.env.get('JWT_SECRET') || 'onpurpose-jwt-secret-default'
}

function authenticateOptional(req: Request): { id: string; name: string } | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(authHeader.slice(7), getJwtSecret()) as any
  } catch {
    return null
  }
}

function authenticateRequired(req: Request): { id: string; name: string } | null {
  const user = authenticateOptional(req)
  return user
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  const store = getStore({ name: 'services', consistency: 'strong' })

  // GET /api/services/my-services
  if (req.method === 'GET' && path === '/api/services/my-services') {
    const user = authenticateRequired(req)
    if (!user) {
      return Response.json({ message: 'No token, authorization denied' }, { status: 401 })
    }

    const { blobs } = await store.list()
    const services = []
    for (const blob of blobs) {
      const service = await store.get(blob.key, { type: 'json' }) as any
      if (service && service.userId === user.id) {
        services.push(service)
      }
    }
    services.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return Response.json(services)
  }

  // GET /api/services
  if (req.method === 'GET' && path === '/api/services') {
    const { blobs } = await store.list()
    const services = []
    for (const blob of blobs) {
      const service = await store.get(blob.key, { type: 'json' }) as any
      if (service) services.push(service)
    }
    services.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return Response.json(services)
  }

  // GET /api/services/:id
  if (req.method === 'GET' && path.startsWith('/api/services/')) {
    const id = path.split('/').pop()!
    const service = await store.get(id, { type: 'json' })
    if (!service) {
      return Response.json({ message: 'Service not found' }, { status: 404 })
    }
    return Response.json(service)
  }

  // POST /api/services
  if (req.method === 'POST' && path === '/api/services') {
    const user = authenticateRequired(req)
    if (!user) {
      return Response.json({ message: 'No token, authorization denied' }, { status: 401 })
    }

    const { title, description, price } = await req.json()
    if (!title || !description || !price || price <= 0) {
      return Response.json({ message: 'Title, description, and a valid price are required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const service = {
      id, title, description, price: parseFloat(price),
      userId: user.id, userName: user.name,
      createdAt: now, updatedAt: now
    }
    await store.setJSON(id, service)
    return Response.json(service, { status: 201 })
  }

  // PUT /api/services/:id
  if (req.method === 'PUT' && path.startsWith('/api/services/')) {
    const user = authenticateRequired(req)
    if (!user) {
      return Response.json({ message: 'No token, authorization denied' }, { status: 401 })
    }

    const id = path.split('/').pop()!
    const service = await store.get(id, { type: 'json' }) as any
    if (!service) {
      return Response.json({ message: 'Service not found' }, { status: 404 })
    }
    if (service.userId !== user.id) {
      return Response.json({ message: 'Not authorized to update this service' }, { status: 403 })
    }

    const { title, description, price } = await req.json()
    const updated = {
      ...service,
      title: title || service.title,
      description: description || service.description,
      price: price ? parseFloat(price) : service.price,
      updatedAt: new Date().toISOString()
    }
    await store.setJSON(id, updated)
    return Response.json(updated)
  }

  // DELETE /api/services/:id
  if (req.method === 'DELETE' && path.startsWith('/api/services/')) {
    const user = authenticateRequired(req)
    if (!user) {
      return Response.json({ message: 'No token, authorization denied' }, { status: 401 })
    }

    const id = path.split('/').pop()!
    const service = await store.get(id, { type: 'json' }) as any
    if (!service) {
      return Response.json({ message: 'Service not found' }, { status: 404 })
    }
    if (service.userId !== user.id) {
      return Response.json({ message: 'Not authorized to delete this service' }, { status: 403 })
    }

    await store.delete(id)
    return Response.json({ message: 'Service deleted successfully' })
  }

  return Response.json({ message: 'Not found' }, { status: 404 })
}

export const config: Config = {
  path: ['/api/services', '/api/services/*']
}
