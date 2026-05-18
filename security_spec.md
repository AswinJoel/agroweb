# AgroConnect Security Specification

## Data Invariants
1. A **User** profile can only be created by the authenticated user whose `uid` matches the document ID.
2. A **Product** listing must have a `farmerId` that matches the authenticated user's `uid`.
3. An **Order** must have a `consumerId` that matches the authenticated user's `uid`.
4. A **DiseasePrediction** must have a `userId` that matches the authenticated user's `uid`.

## Dirty Dozen Payloads (Target: DENY)

1. **Identity Spoofing (User)**: Creating a user profile with a `uid` that doesn't match the auth UID.
2. **Identity Spoofing (Product)**: Creating a product with a `farmerId` belonging to another user.
3. **Price Poisoning**: Updating a product price to a negative value or non-number.
4. **Unauthorized Update (Product)**: Updating another farmer's product listing.
5. **Unauthorized Update (User)**: Updating another user's profile.
6. **Malicious ID injection**: Document IDs that are extremely long or contain invalid characters.
7. **Pritistive Write**: Attempting to set `isVerified` on a user profile as a standard user.
8. **Orphaned Order**: Creating an order without a valid `consumerId`.
9. **Shadow Field injection**: Adding `isAdmin: true` to a user document.
10. **State Shortcut**: Updating an order status from `pending` directly to `delivered` if the business logic requires `shipped` first (optional, but good to have).
11. **Bulk Scraper Query**: Querying `products` without any filters if rules were to forbid it (though products are public).
12. **PII Leakage**: Attempting to read another user's full profile if it contains private info.
