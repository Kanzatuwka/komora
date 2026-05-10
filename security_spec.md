# Security Specification for Комора

## Data Invariants
1. A user can only modify their own profile.
2. An order must belong to the authenticated user who created it.
3. Only an admin can update order status.
4. Products and articles are publicly readable but only admin-writable.
5. Subscribers can be created by anyone, but read/deleted only by admin.
6. Addresses are private to the owner.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different UID than `request.auth.uid`.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` on a user profile creation.
3. **Ghost Field Update**: Attempt to add `isVerified: true` to a user profile update.
4. **Orphaned Order**: Create an order for a `userId` that doesn't match `request.auth.uid`.
5. **State Shortcut**: Attempt to update an order status from `new` directly to `delivered` bypassing `confirmed`.
6. **Resource Poisoning**: Create an order with a document ID of 1MB of junk characters.
7. **Self-Assigned Admin**: Create a document in `/admins/{uid}`.
8. **Immutability Breach**: Attempt to change `createdAt` on a product or article.
9. **PII Leak**: Attempt to list all documents in `/users` as a non-admin.
10. **Query Scraping**: Attempt a collection query on `/orders` without a `where('userId', '==', uid)` clause.
11. **Shadow Write**: Update a product price as a non-admin.
12. **Terminal State Bypass**: Attempt to update a cancelled or delivered order.

## Test Runner (Logic Overview)
The `firestore.rules` will be evaluated against these payloads to ensure `PERMISSION_DENIED`.
