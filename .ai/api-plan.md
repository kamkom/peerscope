# REST API Plan

This document outlines the REST API for the Peerscope application, based on the database schema, product requirements document (PRD), and specified tech stack.

## 1. Resources

The API is designed around the following primary resources:

- **Profiles**: Represents the application-specific data for a logged-in user, extending the `auth.users` record.
- **Characters**: Represents profiles of individuals (including the user) created by the user.
- **Events**: Represents real or hypothetical interactions between Characters.
- **AI Analyses**: Stores the results of AI-powered analyses for Events or Characters.
- **Character Templates**: A non-persistent resource providing helper text for character descriptions.

## 2. Endpoints

All endpoints are prefixed with `/api`. All endpoints require authentication unless otherwise specified.

### 2.1. Profiles

#### Get current user's profile

- **Method**: `GET`
- **URL**: `/profile`
- **Description**: Retrieves the profile for the currently authenticated user.
- **Response Payload**:
  ```json
  {
    "id": "c3f4a3b2-1e0a-4b9c-8c7d-6f5e4d3c2b1a",
    "daily_analysis_count": 1,
    "last_analysis_date": "2025-10-24",
    "created_at": "2025-10-24T10:00:00Z",
    "updated_at": "2025-10-24T11:30:00Z"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `404 Not Found`

### 2.2. Characters

#### List characters

- **Method**: `GET`
- **URL**: `/characters`
- **Description**: Retrieves a paginated list of characters created by the user. Excludes soft-deleted characters by default.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `pageSize` (number, optional, default: 10): The number of items per page.
  - `sortBy` (string, optional, default: 'name'): Field to sort by (e.g., `name`, `last_interacted_at`).
  - `order` (string, optional, default: 'asc'): Sort order ('asc' or 'desc').
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": "a1b2c3d4-...",
        "name": "Jane Doe",
        "role": "Friend",
        "avatar_url": "https://...",
        "is_owner": false,
        "last_interacted_at": "2025-10-20T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`

#### Create a character

- **Method**: `POST`
- **URL**: `/characters`
- **Description**: Creates a new character profile.
- **Request Payload**:
  ```json
  {
    "name": "John Smith",
    "role": "Coworker",
    "description": "Met at the new company.",
    "traits": ["Helpful", "Quiet"],
    "motivations": ["Promotion"],
    "avatar_url": "https://...",
    "is_owner": false
  }
  ```
- **Response Payload**: The newly created character object.
- **Success Code**: `201 Created`
- **Error Codes**: `400 Bad Request` (validation failed), `401 Unauthorized`

#### Get a single character

- **Method**: `GET`
- **URL**: `/characters/{id}`
- **Description**: Retrieves details for a specific character.
- **Response Payload**: A single character object.
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden` (not owner), `404 Not Found`

#### Update a character

- **Method**: `PATCH`
- **URL**: `/characters/{id}`
- **Description**: Partially updates a character's details.
- **Request Payload**:
  ```json
  {
    "role": "Team Lead",
    "last_interacted_at": "2025-10-24T12:00:00Z"
  }
  ```
- **Response Payload**: The updated character object.
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### Delete a character (Soft Delete)

- **Method**: `DELETE`
- **URL**: `/characters/{id}`
- **Description**: Soft-deletes a character by setting the `deleted_at` timestamp.
- **Success Code**: `204 No Content`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### 2.3. Events

#### List events

- **Method**: `GET`
- **URL**: `/events`
- **Description**: Retrieves a paginated list of events created by the user.
- **Query Parameters**:
  - `page` (number, optional, default: 1)
  - `pageSize` (number, optional, default: 10)
  - `sortBy` (string, optional, default: 'event_date')
  - `order` (string, optional, default: 'desc')
- **Response Payload**: Paginated list of event objects.
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`

#### Create an event

- **Method**: `POST`
- **URL**: `/events`
- **Description**: Creates a new event.
- **Request Payload**:
  ```json
  {
    "title": "Project Deadline Discussion",
    "event_date": "2025-10-23T09:00:00Z",
    "description": "A tense meeting about the upcoming deadline.",
    "participant_ids": ["a1b2c3d4-...", "e5f6g7h8-..."]
  }
  ```
- **Response Payload**: The newly created event object.
- **Success Code**: `201 Created`
- **Error Codes**: `400 Bad Request` (e.g., less than 2 participants), `401 Unauthorized`

#### Get a single event

- **Method**: `GET`
- **URL**: `/events/{id}`
- **Description**: Retrieves details for a specific event, including participants.
- **Response Payload**: A single event object with a `participants` array.
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### Update an event

- **Method**: `PATCH`
- **URL**: `/events/{id}`
- **Description**: Partially updates an event's details.
- **Request Payload**:
  ```json
  {
    "title": "Updated: Project Deadline Discussion",
    "participant_ids": ["a1b2c3d4-...", "e5f6g7h8-...", "i9j0k1l2-..."]
  }
  ```
- **Response Payload**: The updated event object.
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### Delete an event

- **Method**: `DELETE`
- **URL**: `/events/{id}`
- **Description**: Permanently deletes an event and its participant associations.
- **Success Code**: `204 No Content`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### 2.4. AI Analyses

#### Run analysis for an event (Mediation)

- **Method**: `POST`
- **URL**: `/events/{id}/analyses`
- **Description**: Triggers a 'mediation' analysis for a specific event.
- **Request Payload**:
  ```json
  {
    "analysis_type": "mediation"
  }
  ```
- **Response Payload**: The newly created AI analysis result.
- **Success Code**: `201 Created`
- **Error Codes**: `401 Unauthorized`, `402 Payment Required` (daily limit reached), `403 Forbidden`, `404 Not Found`, `500 Internal Server Error` (AI service failed)

#### Run analysis for a character (Gift Suggestion)

- **Method**: `POST`
- **URL**: `/characters/{id}/analyses`
- **Description**: Triggers a 'gift_suggestion' analysis for a specific character.
- **Request Payload**:
  ```json
  {
    "analysis_type": "gift_suggestion"
  }
  ```
- **Response Payload**: The newly created AI analysis result.
- **Success Code**: `201 Created`
- **Error Codes**: `401 Unauthorized`, `402 Payment Required` (daily limit reached), `403 Forbidden`, `404 Not Found`, `500 Internal Server Error` (AI service failed)

#### List analyses for an event

- **Method**: `GET`
- **URL**: `/events/{id}/analyses`
- **Description**: Retrieves all AI analyses for a specific event.
- **Response Payload**:
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "event_id": "event-uuid-goes-here",
      "character_id": null,
      "analysis_type": "mediation",
      "result": {
        "summary": "A brief summary of the mediation analysis.",
        "suggestions": ["Suggestion 1 for mediation.", "Suggestion 2 for mediation."]
      },
      "created_at": "2025-10-26T10:00:00Z",
      "feedback": null,
      "outdated_data_warning": "Participant data may be outdated."
    }
  ]
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### List analyses for a character

- **Method**: `GET`
- **URL**: `/characters/{id}/analyses`
- **Description**: Retrieves all AI analyses for a specific character.
- **Response Payload**: An array of AI analysis results (`AiAnalysisDto[]`).
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### Get a single analysis

- **Method**: `GET`
- **URL**: `/analyses/{id}`
- **Description**: Retrieves a specific AI analysis by its ID.
- **Response Payload**: A single AI analysis object (`AiAnalysisDto`).
- **Success Code**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### Submit feedback for an analysis

- **Method**: `PATCH`
- **URL**: `/analyses/{id}/feedback`
- **Description**: Submits user feedback for an AI analysis.
- **Request Payload**:
  ```json
  {
    "feedback": 1
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Feedback submitted successfully."
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request` (invalid feedback value), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### 2.5. Character Templates

#### Get character description template

- **Method**: `GET`
- **URL**: `/character-templates`
- **Description**: Retrieves a description template string based on a character role.
- **Query Parameters**:
  - `role` (string, required): The role of the character (e.g., 'Coworker', 'Friend').
- **Response Payload**:
  ```json
  {
    "template": "What are their main responsibilities? How are our relations at work? What are their professional strengths and weaknesses?"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request` (missing role), `404 Not Found` (no template for the given role)

## 3. Authentication and Authorization

- **Authentication**: The API will use JWTs provided by Supabase Auth. The client must include the JWT in the `Authorization` header of every request as a Bearer token (`Authorization: Bearer <YOUR_JWT>`).
- **Authorization**: Data access is enforced by PostgreSQL's Row-Level Security (RLS) policies, as defined in the database schema plan. These policies ensure that users can only access and manipulate their own data (`profiles`, `characters`, `events`, etc.). Any attempt to access another user's data will result in a `403 Forbidden` or `404 Not Found` error.

### 3.1

### 3.2. Authentication API Endpoints

#### Register a new user

- **Method**: `POST`
- **URL**: `/auth/register`
- **Description**: Registers a new user account using email and password.
- **Request Payload** (as `multipart/form-data`):
  - `email` (string, required): User's email address
  - `password` (string, required): User's chosen password
- **Response**:
  - **Success**:
    - **Code**: `302 Found`
    - **Action**: Redirects to `/dashboard` after successful registration & auto-login.
  - **Error Codes**:
    - `400 Bad Request` — missing email or password
    - `500 Internal Server Error` — registration failed (e.g. email already exists; message clearly describes the error)

#### Log in an existing user

- **Method**: `POST`
- **URL**: `/auth/signin`
- **Description**: Signs an existing user in using their email and password.
- **Request Payload** (as `multipart/form-data`):
  - `email` (string, required): User's email address
  - `password` (string, required): User's password
- **Response**:
  - **Success**:
    - **Code**: `302 Found`
    - **Action**: Redirects to `/dashboard` after successful login. Session tokens are set via HTTP cookies.
  - **Error Codes**:
    - `400 Bad Request` — missing email or password
    - `500 Internal Server Error` — authentication failed (invalid credentials or other error; message describes the error)

**Note:** Both endpoints expect data in `multipart/form-data` format (standard HTML form submission). Authentication and session management are handled via Supabase Auth. The API returns clear error messages and proper HTTP status codes for all failure cases. Successful login/registration always results in a redirect to `/dashboard`.

## 4. Validation and Business Logic

- **Validation**:
  - Standard validation for data types, required fields (`NOT NULL`), and formats (e.g., email) will be enforced.
  - `Characters`: `name` is required.
  - `Events`: `title` and `participant_ids` are required. `participant_ids` must contain at least two unique character IDs belonging to the user.
  - `AI Analyses`: `feedback` must be either `1` or `-1`.
- **Business Logic**:
  - **AI Daily Limit**: Before processing a request to an analysis endpoint, the API will check the `daily_analysis_count` and `last_analysis_date` on the user's `profile`. If the count is 2 or more for the current date, a `402 Payment Required` status will be returned. Otherwise, the count is incremented.
  - **Soft Deletes**: The `DELETE /characters/{id}` endpoint performs a soft delete by setting the `deleted_at` field. List endpoints for characters will automatically filter out records where `deleted_at` is not null.
  - **Event Participants**: When creating or updating an event, the API will manage the records in the `event_participants` junction table based on the provided `participant_ids` array.
  - **Outdated Data Warning**: When retrieving an AI analysis for an event, the API will check the `last_interacted_at` date for all participants. If any are older than two weeks, a warning will be included in the API response.
