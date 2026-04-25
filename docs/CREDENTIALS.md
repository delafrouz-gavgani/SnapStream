# SnapStream — Login Credentials

## Creator Accounts (role: creator)

| Name           | Email | Password |
|----------------|-------|----------|
| Melika Rosta   | `melika@snapstream.com` | `Melika@Str1!` |
| Omar Hassan    | `omar@snapstream.com` | `Omar#Vid2!` |
| Nina Cole      | `nina@snapstream.com` | `Nina!Cole3@` |

## Consumer Account (role: consumer)

| Name           | Email | Password |
|----------------|-------|----------|
| Cam Viewer     | `viewer@snapstream.com` | `Cam@View1!2` |

---

Passwords are bcrypt-hashed in the database.
Re-seed at any time: `cd backend && node prisma/seed.js`
