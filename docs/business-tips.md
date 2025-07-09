# Business Tips and Monetization

The analytics service can analyze usage patterns to provide revenue suggestions.
Enable by setting `ENABLE_BUSINESS_TIPS=true` when starting the analytics service.

## API

`GET /analytics/businessTips` returns:

```json
{
  "tips": ["Consider adding paid plans"],
  "marketing": "Promote your app's key features to attract users."
}
```

Tips are generated from event counts including `purchase`, `trialStart` and
`conversion` types. When `OPENAI_API_KEY` is configured, a short marketing blurb
is produced using the OpenAI API.

Additional heuristics suggest discounts when many trials have little purchase
activity.

## Portal

The portal page `business.tsx` displays the returned tips next to the cost
forecast so teams can evaluate pricing strategies alongside projected spend.
