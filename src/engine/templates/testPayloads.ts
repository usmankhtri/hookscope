export interface PayloadTemplate {
  id: string;
  name: string;
  provider: string;
  description: string;
  method: 'POST' | 'PUT' | 'GET';
  headers: Record<string, string>;
  body: string;
}

export const SIMULATED_PAYLOAD_TEMPLATES: PayloadTemplate[] = [
  {
    id: 'stripe-payment-intent',
    name: 'Stripe – payment_intent.succeeded',
    provider: 'Stripe (Simulated)',
    description: 'Simulated payment intent succeeded event with charges and customer metadata.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 't=1695984000,v1=simulated_5a73e61c56f8f78b849e7a9b0c2a8f',
      'User-Agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    },
    body: JSON.stringify(
      {
        id: 'evt_sim_3Mvw9uLkdIwHu7ix0rW7eX9N',
        object: 'event',
        api_version: '2023-10-16',
        created: 1695984000,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_3Mvw9uLkdIwHu7ix0rW7eX9N',
            object: 'payment_intent',
            amount: 4900,
            amount_received: 4900,
            currency: 'usd',
            status: 'succeeded',
            customer: 'cus_O8LkdIwHu7',
            payment_method: 'pm_1Mvw9tLkdIwHu7ixUoQyWz01',
            metadata: {
              order_id: 'ord_98721',
              tier: 'pro_annual',
            },
          },
        },
        livemode: false,
        pending_webhooks: 1,
      },
      null,
      2
    ),
  },
  {
    id: 'github-push',
    name: 'GitHub – push event',
    provider: 'GitHub (Simulated)',
    description: 'Simulated git push event containing commits, repository info, and pusher details.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push',
      'X-GitHub-Delivery': '72h58190-619e-11ee-82bc-9d0df5248232',
      'X-Hub-Signature-256': 'sha256=simulated_8f0a394ec5642d9f37929d2bf9c81123',
      'User-Agent': 'GitHub-Hookshot/7b8f9e0',
    },
    body: JSON.stringify(
      {
        ref: 'refs/heads/main',
        before: '6113728f27ae82c7b1a12f6593df5f0fa4e0',
        after: '8b7f805a9c72e2938a9028a38b5efb867e3a',
        repository: {
          id: 1296269,
          name: 'hooklab-demo',
          full_name: 'acme/hooklab-demo',
          private: false,
          owner: {
            name: 'octocat',
            email: 'octocat@github.com',
          },
        },
        pusher: {
          name: 'octocat',
          email: 'octocat@github.com',
        },
        commits: [
          {
            id: '8b7f805a9c72e2938a9028a38b5efb867e3a',
            message: 'fix: validate incoming webhook signatures safely',
            timestamp: '2026-09-29T10:14:00Z',
            author: {
              name: 'Octocat Developer',
              email: 'octocat@github.com',
            },
            added: ['src/engine/hmac.ts'],
            modified: ['README.md'],
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'shopify-order-created',
    name: 'Shopify – orders/create',
    provider: 'Shopify (Simulated)',
    description: 'Simulated order created event with line items and shipping addresses.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Topic': 'orders/create',
      'X-Shopify-Hmac-Sha256': 'simulated_2c7a38e8fb92a0d9b4c81a2e76f920',
      'X-Shopify-Shop-Domain': 'acme-store.myshopify.com',
      'User-Agent': 'Shopify-Partner/1.0',
    },
    body: JSON.stringify(
      {
        id: 820982911946154500,
        email: 'customer@example.com',
        created_at: '2026-09-29T11:20:00-04:00',
        currency: 'USD',
        total_price: '119.50',
        subtotal_price: '109.50',
        total_tax: '10.00',
        financial_status: 'paid',
        line_items: [
          {
            id: 866550311766439000,
            variant_id: 7085221601008,
            title: 'Developer Mechanical Keyboard',
            quantity: 1,
            price: '109.50',
            sku: 'KB-DEV-01',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'slack-event-callback',
    name: 'Slack – message event',
    provider: 'Slack (Simulated)',
    description: 'Simulated event callback payload for a channel message event.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Slack-Signature': 'v0=simulated_a2114d57b48eac39b9ad189dd83104ec4141e811e5ab50140f20f43d340f45de',
      'X-Slack-Request-Timestamp': '1695984200',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
    },
    body: JSON.stringify(
      {
        token: 'simulated_verification_token',
        team_id: 'T012AB34C5',
        api_app_id: 'A012D34E5F',
        event: {
          type: 'message',
          channel: 'C012AB3CD',
          user: 'U012A3CDE',
          text: 'Deploying release v2.4.0 to production cluster',
          ts: '1695984200.000100',
        },
        type: 'event_callback',
        event_id: 'Ev012F3G4H',
        event_time: 1695984200,
      },
      null,
      2
    ),
  },
  {
    id: 'discord-interaction',
    name: 'Discord – webhook interaction',
    provider: 'Discord (Simulated)',
    description: 'Simulated Discord bot slash-command interaction ping.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature-Ed25519': 'simulated_ed25519_sig_f7823b190a',
      'X-Signature-Timestamp': '1695984300',
      'User-Agent': 'Discord-Bot (https://discord.com, 1.0)',
    },
    body: JSON.stringify(
      {
        id: '115801982736192837',
        application_id: '998877665544332211',
        type: 2,
        data: {
          id: '115801982736192838',
          name: 'status',
          type: 1,
        },
        guild_id: '123456789012345678',
        channel_id: '234567890123456789',
        member: {
          user: {
            id: '345678901234567890',
            username: 'dev_lead',
            discriminator: '0001',
          },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'generic-json-webhook',
    name: 'Generic – JSON Webhook Event',
    provider: 'Generic JSON (Simulated)',
    description: 'Standard JSON event payload with nested entities and ISO timestamp.',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Event': 'entity.updated',
      'X-Request-Id': 'req_7a8b9c0d1e2f',
    },
    body: JSON.stringify(
      {
        event: 'user.profile_updated',
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        data: {
          user_id: 'usr_89217',
          email: 'alex.morgan@example.com',
          name: 'Alex Morgan',
          role: 'administrator',
          preferences: {
            notifications: true,
            theme: 'dark',
            locale: 'en-US',
          },
        },
      },
      null,
      2
    ),
  },
];
