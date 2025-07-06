import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { initSentry } from "../../packages/shared/src/sentry";

initSentry('email');
const ses = new SESClient({});

export interface SendOptions {
  template: string;
  to: string;
  data: Record<string, string>;
}

export async function sendEmail(opts: SendOptions) {
  const command = new SendTemplatedEmailCommand({
    Destination: { ToAddresses: [opts.to] },
    Source: `no-reply@${process.env.EMAIL_DOMAIN}`,
    Template: opts.template,
    TemplateData: JSON.stringify(opts.data),
  });
  return ses.send(command);
}
