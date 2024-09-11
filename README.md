## Overview

This repository contains the backend server for the Techpack AI web app.

## Getting Started

1. Configure your environment variables by creating a ```.env``` file with the following env vars:
    ```
    SUPABASE_URL=
    SUPABASE_ANON_KEY=
    OPENAI_API_KEY=
    SERVER_PORT=
    ```

    Note: Ensure that your backend server and Nextjs app are running on different ports.

2. Then, run the development server:

    ```npm run dev```

3. You can test the endpoints in `src/index.ts` by sending cURL requests.
