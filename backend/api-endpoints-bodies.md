# API Endpoint Request Bodies

## Auth Endpoints (`/api/auth`)

### POST /api/auth/register

Registers a new user.

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### POST /api/auth/login

Logs in a user.

```json
{
  "email": "string",
  "password": "string"
}
```

### GET /api/auth/me

No body. Requires Authorization header:

```
Authorization: Bearer <token>
```

### POST /api/auth/logout

No body. (Just call the endpoint to log out.)

---

## Listing Endpoints (`/api/listings`)

### GET /api/listings

No body.

### GET /api/listings/:id

No body.

### POST /api/listings

Creates a new listing. Requires Authorization header:

```
Authorization: Bearer <token>
```

```json
{
  "title": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "location": "string",
  "images": ["string", ...],   // optional
  "status": "string"           // optional
}
```

### PUT /api/listings/:id

Updates a listing. Requires Authorization header:

```
Authorization: Bearer <token>
```

```json
{
  "title": "string",           // optional
  "description": "string",     // optional
  "price": number,             // optional
  "category": "string",        // optional
  "location": "string",        // optional
  "images": ["string", ...],   // optional
  "status": "string"           // optional
}
```

### DELETE /api/listings/:id

No body. Requires Authorization header:

```
Authorization: Bearer <token>
```
