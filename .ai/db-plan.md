# Peerscope - Database Schema Plan

## 1. Tables, Columns, and Constraints

### Custom Types

**analysis_type_enum**
A custom ENUM type to define the kind of AI analysis performed.

```sql
CREATE TYPE public.analysis_type_enum AS ENUM ('mediation', 'gift_suggestion');
```

---

### Tables

**users**

This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

**profiles**
This table extends the `auth.users` table to store application-specific user data.

| Column Name            | Data Type                  | Constraints                                                  | Description                                             |
| ---------------------- | -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `id`                   | `UUID`                     | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to `auth.users`.                            |
| `daily_analysis_count` | `SMALLINT`                 | `NOT NULL`, `DEFAULT 0`                                      | Tracks the number of AI analyses performed today.       |
| `last_analysis_date`   | `DATE`                     | `NOT NULL`, `DEFAULT CURRENT_DATE`                           | The date of the last analysis to reset the daily count. |
| `created_at`           | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                                  | Timestamp of when the profile was created.              |
| `updated_at`           | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                                  | Timestamp of the last update.                           |

**characters**
Stores profiles of individuals created by the user, including the user's own profile.

| Column Name          | Data Type                  | Constraints                                             | Description                                                       |
| -------------------- | -------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| `id`                 | `UUID`                     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`              | Unique identifier for the character.                              |
| `user_id`            | `UUID`                     | `NOT NULL`, `REFERENCES profiles(id) ON DELETE CASCADE` | The user who owns this character profile.                         |
| `name`               | `TEXT`                     | `NOT NULL`                                              | The character's name.                                             |
| `role`               | `TEXT`                     | `NULL`                                                  | The character's role in the user's life (e.g., Friend, Coworker). |
| `description`        | `TEXT`                     | `NULL`                                                  | A detailed description of the character.                          |
| `traits`             | `TEXT[]`                   | `NULL`                                                  | An array of character traits.                                     |
| `motivations`        | `TEXT[]`                   | `NULL`                                                  | An array of character motivations or goals.                       |
| `avatar_url`         | `TEXT`                     | `NULL`                                                  | URL to the avatar image stored in Supabase Storage.               |
| `is_owner`           | `BOOLEAN`                  | `NOT NULL`, `DEFAULT false`                             | `true` if this character represents the user themselves.          |
| `last_interacted_at` | `TIMESTAMP WITH TIME ZONE` | `NULL`                                                  | Timestamp of the last interaction, manually set by the user.      |
| `created_at`         | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                             | Timestamp of when the character was created.                      |
| `updated_at`         | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                             | Timestamp of the last update.                                     |
| `deleted_at`         | `TIMESTAMP WITH TIME ZONE` | `NULL`                                                  | Timestamp for soft-deleting the character.                        |

**events**
Represents real or hypothetical interactions between characters.

| Column Name   | Data Type                  | Constraints                                             | Description                                    |
| ------------- | -------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `id`          | `UUID`                     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`              | Unique identifier for the event.               |
| `user_id`     | `UUID`                     | `NOT NULL`, `REFERENCES profiles(id) ON DELETE CASCADE` | The user who owns this event.                  |
| `title`       | `TEXT`                     | `NOT NULL`                                              | The title of the event.                        |
| `event_date`  | `TIMESTAMP WITH TIME ZONE` | `NULL`                                                  | The date the event occurred or is planned for. |
| `description` | `TEXT`                     | `NULL`                                                  | A detailed description of the event.           |
| `created_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                             | Timestamp of when the event was created.       |
| `updated_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                             | Timestamp of the last update.                  |

**event_participants**
A junction table to model the many-to-many relationship between `events` and `characters`.

| Column Name    | Data Type | Constraints                                               | Description                            |
| -------------- | --------- | --------------------------------------------------------- | -------------------------------------- |
| `event_id`     | `UUID`    | `NOT NULL`, `REFERENCES events(id) ON DELETE CASCADE`     | Foreign key to the `events` table.     |
| `character_id` | `UUID`    | `NOT NULL`, `REFERENCES characters(id) ON DELETE CASCADE` | Foreign key to the `characters` table. |
|                |           | `PRIMARY KEY (event_id, character_id)`                    | Composite primary key.                 |

**ai_analyses**
Stores the results of AI analyses, which can be related to either an `event` or a `character`.

| Column Name     | Data Type                  | Constraints                                                                                                  | Description                                                                       |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `id`            | `UUID`                     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                                                                   | Unique identifier for the analysis.                                               |
| `user_id`       | `UUID`                     | `NOT NULL`, `REFERENCES profiles(id) ON DELETE CASCADE`                                                      | The user who requested the analysis.                                              |
| `event_id`      | `UUID`                     | `NULL`, `REFERENCES events(id) ON DELETE CASCADE`                                                            | The event being analyzed (if applicable).                                         |
| `character_id`  | `UUID`                     | `NULL`, `REFERENCES characters(id) ON DELETE CASCADE`                                                        | The character being analyzed (if applicable).                                     |
| `analysis_type` | `analysis_type_enum`       | `NOT NULL`                                                                                                   | The type of analysis performed ('mediation' or 'gift_suggestion').                |
| `result`        | `JSONB`                    | `NOT NULL`                                                                                                   | The structured result from the AI model.                                          |
| `feedback`      | `SMALLINT`                 | `NULL`                                                                                                       | User feedback: `1` for thumbs up, `-1` for thumbs down.                           |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                                                                                  | Timestamp of when the analysis was created.                                       |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                                                                                  | Timestamp of the last update.                                                     |
|                 |                            | `CHECK ((event_id IS NOT NULL AND character_id IS NULL) OR (event_id IS NULL AND character_id IS NOT NULL))` | Ensures the analysis is linked to exactly one parent entity (event or character). |

## 2. Table Relationships

- **`auth.users` to `profiles`**: One-to-One. Each user in `auth.users` has exactly one corresponding `profiles` record.
- **`profiles` to `characters`**: One-to-Many. Each user can have multiple character profiles.
- **`profiles` to `events`**: One-to-Many. Each user can create multiple events.
- **`profiles` to `ai_analyses`**: One-to-Many. Each user can perform multiple AI analyses.
- **`events` to `characters`**: Many-to-Many, facilitated by the `event_participants` junction table. An event can have multiple characters, and a character can participate in multiple events.
- **Polymorphic relationship from `ai_analyses`**: An `ai_analyses` record can belong to either one `events` record or one `characters` record.

## 3. Indexes

To optimize query performance, indexes should be created on all foreign key columns.

- `CREATE INDEX idx_characters_user_id ON public.characters(user_id);`
- `CREATE INDEX idx_events_user_id ON public.events(user_id);`
- `CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);`
- `CREATE INDEX idx_event_participants_character_id ON public.event_participants(character_id);`
- `CREATE INDEX idx_ai_analyses_user_id ON public.ai_analyses(user_id);`
- `CREATE INDEX idx_ai_analyses_event_id ON public.ai_analyses(event_id);`
- `CREATE INDEX idx_ai_analyses_character_id ON public.ai_analyses(character_id);`

## 4. Row-Level Security (RLS) Policies

RLS must be enabled on all tables containing user data to ensure data privacy.

```sql
-- Helper function to get the current user's ID
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE sql STABLE;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles'
CREATE POLICY "Users can manage their own profile."
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Policies for 'characters'
CREATE POLICY "Users can manage their own characters."
  ON public.characters FOR ALL
  USING (auth.uid() = user_id);

-- Policies for 'events'
CREATE POLICY "Users can manage their own events."
  ON public.events FOR ALL
  USING (auth.uid() = user_id);

-- Policies for 'event_participants'
CREATE POLICY "Users can manage participants of their own events."
  ON public.event_participants FOR ALL
  USING ((SELECT user_id FROM public.events WHERE id = event_id) = auth.uid());

-- Policies for 'ai_analyses'
CREATE POLICY "Users can manage their own AI analyses."
  ON public.ai_analyses FOR ALL
  USING (auth.uid() = user_id);
```

## 5. Additional Notes and Design Decisions

- **Auto-updating `updated_at` columns**: A trigger should be implemented to automatically update the `updated_at` column whenever a row is modified. Supabase provides extensions (like `moddatetime`) that can handle this, or a custom trigger function can be created.
- **Soft Deletes**: The `characters` table uses a `deleted_at` column for soft deletes. Application logic should filter queries to only include records where `deleted_at IS NULL`.
- **Cascading Deletes**: `ON DELETE CASCADE` is used extensively. When a user is deleted from `auth.users`, all their associated data (`profiles`, `characters`, `events`, etc.) will be automatically and cleanly removed from the database, ensuring data integrity.
- **Business Logic in Application Layer**: Complex validation rules, such as requiring a minimum of two participants for an event or handling description templates, will be managed in the application's backend logic rather than through complex database constraints. This keeps the database schema clean and flexible for the MVP.
