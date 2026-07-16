const express = require('express');
const stripeWebhooks = require('./stripe-webhooks');
const createBillingPortalSession = require('./create-billing-portal-session');

const stripeRouter = express.Router();

// Webhook. Signature verification needs the raw body: express.raw() handles the CSP-off case,
// and server/index.js's json `verify` hook stashes req.rawBody for the CSP-on case.
stripeRouter.post('/webhooks', express.raw({ type: 'application/json' }), stripeWebhooks);

// Returns a Stripe Billing Portal URL for the authenticated user to manage/cancel their plan.
stripeRouter.get('/create-billing-portal-session', createBillingPortalSession);

module.exports = stripeRouter;
