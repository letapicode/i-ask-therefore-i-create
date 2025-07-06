# Email Service

Provides helper functions for sending templated emails via Amazon SES.

## Usage

Set `EMAIL_DOMAIN` in your environment and call `sendEmail`:

```ts
import { sendEmail } from "email-service";

await sendEmail({
  template: "build",
  to: "user@example.com",
  data: { project: "Demo" }
});
```
