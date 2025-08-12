# Social Spark Frontend

## LinkedIn Setup & Usage

1. Create LinkedIn App (see backend README) and get Client ID/Secret.
2. Configure redirect route in the Angular app (e.g., `/linkedin/callback`).
3. Authorization URL to initiate login (open in a new window/tab):
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=LINKEDIN_CLIENT_ID&redirect_uri=ENCODED_REDIRECT&scope=r_liteprofile%20r_emailaddress%20w_member_social%20w_organization_social%20rw_organization_admin
```
4. On redirect, read the `code` from the query string and call backend:
```
POST /api/social-accounts/linkedin/oauth/exchange { code }
```
This returns `{ access_token, expires_in }`.

5. Use LinkedInService methods:
- `exchangeCodeForToken(code)` – exchange code for token
- `createMemberPost(accessToken, authorUrn, text)`
- `createOrganizationPost(accessToken, orgUrn, text)`
- `listMemberPosts(accessToken, authorUrn, start?, count?)`
- `listOrganizationPosts(accessToken, orgUrn, start?, count?)`
- `deletePost(accessToken, urn)`

Notes:
- Validate inputs before calling (non-empty text, valid URNs).
- Show user-friendly errors when LinkedIn returns authorization or permission errors. 
