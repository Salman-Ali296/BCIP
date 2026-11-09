<<<<<<< HEAD
# AI-Powered Business Complaint Platform

# AI-Powered-Business-Complaint-Platform

## Backend billing setup

The Express API billing endpoints require Stripe credentials and Stripe Price IDs
for the Starter, Growth, and Business plans. Set these in the backend's environment:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_YEARLY
STRIPE_PRICE_GROWTH_MONTHLY
STRIPE_PRICE_GROWTH_YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY
STRIPE_PRICE_BUSINESS_YEARLY
FRONTEND_URL
```

Apply the backend Prisma migration and regenerate the Prisma client after configuring
the database. Configure the Stripe webhook destination as
`/api/v1/auth/billing/webhook/Stripe` and subscribe to
`checkout.session.completed` and `customer.subscription.created`,
`customer.subscription.updated`, and `customer.subscription.deleted`.

Authenticated business administrators can use
`/api/v1/auth/billing/checkout` (POST; `plan` and optional `interval`),
`/subscription` (GET), `/portal` (POST), `/cancel` (POST), and `/resume` (POST).
The webhook endpoint is provider-authenticated using its Stripe signature instead
of a user access token.
=======
# BCIP
>>>>>>> 4d1e079f4a9e06597888d1e5495c5faf9dae1eef
