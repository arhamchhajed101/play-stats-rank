# Project technical rules

- Keep game-removal cleanup in the authenticated database RPC `remove_tracked_game`; it atomically removes one user's stats and tracking row under account-scoped policies, preventing stale data from returning.
- Keep app-wide visual styling in semantic global theme tokens so pages remain visually consistent and themeable.