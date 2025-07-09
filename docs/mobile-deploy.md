# App Store Deployment Automation

The platform can package and submit generated React Native apps to the Apple App Store and Google Play. Credentials for each tenant are stored via the connector API using `appleKey` and `googleKey` fields.

Use the `publishMobile` endpoint on the orchestrator to trigger a submission:

```bash
curl -X POST http://localhost:3002/api/publishMobile/<jobId> -H "x-tenant-id: TENANT"
```

Internally this calls `fastlane` through the `tools/publish-mobile.js` script. Ensure you have Apple and Google developer accounts and have configured API keys in the connectors page of the portal.

See official review guidelines for each store before publishing.
