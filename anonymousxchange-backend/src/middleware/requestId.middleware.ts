import { Request, Response, NextFunction } from 'express'

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['x-request-id']
  const requestId = Array.isArray(header) ? header[0] : header || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
  req.headers['x-request-id'] = requestId
  res.setHeader('x-request-id', requestId)
  next()
}
