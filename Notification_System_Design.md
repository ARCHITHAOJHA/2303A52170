# Notification System Design

## Goal
Design a robust, secure, and scalable notification system to deliver campus notifications to users via an API and optional realtime channel. This document describes architecture choices, API contract, data model, auth, error handling, scaling, and testing strategies.

## Constraints & assumptions
- The provided evaluation API endpoint is a protected route (requires authentication).
- Frontend should be able to poll or receive realtime updates.
- Persistence is optional depending on requirements — design supports both ephemeral and persistent modes.
- Must support filtering, pagination, and light search by metadata.

## High-level architecture
- Clients: Web (React), Mobile (optional). They request notifications from the Notification API.
- API Layer: A RESTful notifications API (behind API Gateway) that validates auth, enforces rate limits, and returns paginated notification lists.
- Auth: JWT Bearer or API key depending on consumer. API Gateway validates tokens and forwards user context.
- Storage (optional): Lightweight datastore (Postgres / DynamoDB) for persistence, with an event store or message queue for ingestion.
- Realtime: WebSocket / Server-Sent Events (SSE) through a dedicated service or using the same API server with socket support.
- Ingestion: Producers (admin UI, backends) post notifications to the API or message queue. Workers enrich and persist notifications if needed.

## Components
- API Gateway / Reverse Proxy: Routing, TLS termination, CORS, auth enforcement, rate limiting.
- Notification Service (stateless): Implements endpoints, validation, transformations, and reads from storage or cache.
- Auth service / Identity Provider: Issues and validates JWT tokens or API keys.
- Storage: Persistent DB (Postgres / MySQL) or NoSQL (DynamoDB) to hold notifications and indices for queries.
- Cache: Redis for hot data and pagination acceleration.
- Message Queue: Kafka/RabbitMQ/SQS for durable ingestion and fan-out to realtime channels.
- Realtime Hub: WebSocket server (e.g., socket.io, ws) or SSE provider for push updates.

## Data model (example)
Notification {
  id: string (uuid),
  type: string, // e.g., "Event", "Result", "Placement"
  title: string,
  message: string,
  timestamp: ISO8601,
  audience: { groups: [], roles: [] } optional,
  metadata: object optional (tags, priority),
  read_by: [] optional (for per-user read state stored separately),
}

Pagination response:
{
  "notifications": [ ... ],
  "page": 1,
  "limit": 20,
  "total": 123
}

## API endpoints (REST)
- GET /evaluation-service/notifications?page=1&limit=20&notification_type=Event
  - Description: list notifications (paginated + filter by type)
  - Auth: Bearer token
  - Response: 200 with `notifications` array

- GET /evaluation-service/notifications/:id
  - Description: get a single notification

- POST /evaluation-service/notifications
  - Description: create notification (protected to admins/services)
  - Body: Notification payload
  - Behavior: publish to queue and persist (if configured)

- POST /evaluation-service/notifications/:id/read
  - Mark notification read for current user

- Optional: WebSocket/SSE endpoint `/ws/notifications` for realtime push

## Authentication & Authorization
- Prefer JWT Bearer tokens issued by central IdP. Token contains `sub` (user id) and scopes/roles.
- API Gateway validates token and forwards `x-user-id` header to the service.
- Admin creation endpoints require an `admin` scope or role.

## Error handling & client UX
- For failures (401, 500), return structured JSON: { code, message, details? }
- UI behavior: show friendly error like "Failed to fetch notifications". For 401, surface "Login required".
- Retries: Clients should retry GET with exponential backoff for network errors (not for 401/403).

## CORS & local development
- In dev, use CRA proxy or a local proxy to avoid CORS shown in browser.
- In production, ensure backend sets a single `Access-Control-Allow-Origin` header and proper credentials policy if cookies are used.

## Security
- Rate-limit public endpoints.
- Sanitize notification content to prevent XSS (escape or allow only safe HTML subset).
- Protect admin endpoints with strict auth and IP whitelisting if needed.

## Scalability
- Use horizontal scaling for stateless API servers behind a load balancer.
- Use Redis and DB indexes to serve pagination efficiently.
- Use message queue to decouple producers from consumers and to fan-out to realtime servers.
- Shard storage or use partition keys for large data.

## Monitoring & observability
- Metrics: request rates, error rates, latency, queue depth.
- Logs: structured logs with request id and user id.
- Tracing: instrument critical flows with distributed tracing.

## Testing
- Unit tests for service logic and validation.
- Integration tests for API routes with mocked auth.
- E2E tests for main UX flows (list, filter, mark read).

## Deployment
- Containerize services and deploy via Kubernetes or managed containers.
- Use CI to run tests and build images.
- Canary deploys for API changes.

## Next steps / Implementation options
- Minimal (no persistence): implement API that reads from in-memory or static source for evaluation; useful for demo.
- Persistent: add Postgres + worker to persist and index notifications.
- Realtime: add WebSocket server and a small pub/sub broker (Redis pub/sub) for local demo.

---

This document is a compact design intended to be implemented incrementally. If you want, I can scaffold a minimal server that exposes the documented endpoints (with JWT mock validation) so the frontend can fetch notifications without 401 errors during local development.
