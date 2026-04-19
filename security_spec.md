## Data Invariants
1. A user document can only be read and updated by the user whose UID matches the document ID.
2. A scan document can only be created by the user whose UID matches `userId`.
3. A scan document can only be read, listed, or deleted by the user whose UID matches `userId`. (Scans are immutable after creation).
4. Timestamp `createdAt` must match `request.time` during creation, `updatedAt` on update.

## "Dirty Dozen" Payloads
1. User creates profile for another UID.
2. User updates another user's profile.
3. User creates a scan but sets the `userId` to another user's UID.
4. User tries to update `userId` property of their own scan.
5. User tries to list scans where `userId` is not their own.
6. Unauthenticated read of a scan.
7. Unauthenticated write to `/users/{userId}`.
8. User creates scan with missing required properties.
9. User updates `co2` metric of an existing scan (Denial of State change).
10. User creates scan with oversized payload for `url`.
11. User sets string arrays and non-allowed properties.
12. Creating a scan without setting `createdAt` to server timestamp.
