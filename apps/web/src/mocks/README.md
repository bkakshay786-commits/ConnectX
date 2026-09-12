# Mock adapters

Replaceable stand-ins for FastAPI. Keep payload shapes identical to production DTOs.

Do not put `const fakeUser = ...` inside UI components.
Do not mix mock AI answers into `lib/api` production services.

`VITE_USE_MOCKS=true` selects this layer in later phases.
