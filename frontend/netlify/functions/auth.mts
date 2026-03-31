import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  return Netlify.env.get('JWT_SECRET') || 'onpurpose-jwt-secret-default'
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ message: 'Method not allowed' }, { status: 405 })
  }

  const url = new URL(req.url)
  const path = url.pathname
  const store = getStore({ name: 'users', consistency: 'strong' })

  if (path === '/api/auth/register') {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await store.get(email, { type: 'json' })
    if (existing) {
      return Response.json({ message: 'User already exists' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = { id, name, email, password: hashedPassword, role: 'customer', createdAt: new Date().toISOString() }

    await store.setJSON(email, user)

    const idStore = getStore({ name: 'users-by-id', consistency: 'strong' })
    await idStore.set(id, email)

    const token = jwt.sign({ id, name }, getJwtSecret(), { expiresIn: '7d' })

    return Response.json({
      message: 'User created successfully',
      token,
      user: { id, name, email }
    }, { status: 201 })
  }

  if (path === '/api/auth/login') {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const user = await store.get(email, { type: 'json' }) as any
    if (!user) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 })
    }

    const token = jwt.sign({ id: user.id, name: user.name }, getJwtSecret(), { expiresIn: '7d' })

    return Response.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  }

  return Response.json({ message: 'Not found' }, { status: 404 })
}

export const config: Config = {
  path: ['/api/auth/register', '/api/auth/login'],
  method: 'POST'
}
