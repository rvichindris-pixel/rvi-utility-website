# RVI Utility website — handover

Live site: https://rviutility.co.uk
Repository: https://github.com/rvichindris-pixel/rvi-utility-website

## 1. Stack

| Part | What it is |
|---|---|
| Website | A single static HTML file: `index.html`. All CSS and JavaScript are inline. The logo and favicon are embedded as base64 data URIs. No framework and no build step. |
| Images | `images/` holds the hero, section backgrounds, gallery (`work-1.jpg` … `work-9.jpg`) and the link-preview image `og-image.jpg` (1200×630). |
| Contact form backend | One Vercel serverless function: `api/contact.mjs`. It sends email through **Resend**. |
| Hosting | **Vercel**. The project is connected to the GitHub repo and every push to `main` deploys to production. |
| DNS / domain | `rviutility.co.uk` is registered and its DNS is hosted at **Namecheap** (nameservers `dns1/dns2.registrar-servers.com`). Namecheap email forwarding handles the `info@` mailbox. |

Other files in the repo:

- `scripts/make-og-image.mjs` regenerates `images/og-image.jpg` from `images/work-4.jpg`.
- `scripts/watermark.mjs` writes logo-stamped copies of the photos to `images-branded/`. The live site does not currently use these.
- `new-logo-clean.png` is the source logo used by the watermark script.
- `site-full.html`, `rvi-coming-soon.html`, `coming-soon-backup.html` are **old copies** of the site and the coming-soon page. They are **publicly reachable** (for example `rviutility.co.uk/site-full.html`). Edit `index.html` only. These three files can safely be deleted.

## 2. Environment variables

Set these in Vercel under **Project → Settings → Environment Variables**, scoped to Production (and Preview if wanted). Names only are listed here. Never commit the values.

| Name | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | **Yes** | Resend API key used to send quote-request emails. |
| `CONTACT_TO_EMAIL` | Recommended | Where quote requests are delivered. Separate several addresses with commas. If unset, it falls back to the address hard-coded in `api/contact.mjs`. |
| `CONTACT_FROM_EMAIL` | Optional | Sender, for example `RVI Utility Website <info@rviutility.co.uk>`. It must be on a domain verified in Resend. If unset, it falls back to that value. |

After adding or changing a variable, **redeploy** (see section 5). Running deployments don't pick up changes.

## 3. How the contact form sends email

1. A visitor fills in the "Request a quote" form in `index.html`. The fields are name, company, phone, email, type of work and job details.
2. JavaScript at the bottom of `index.html` sends the form as JSON to `POST /api/contact`.
3. `api/contact.mjs` checks that name, email and details are present. It then calls Resend:
   - **from** `CONTACT_FROM_EMAIL`
   - **to** `CONTACT_TO_EMAIL`
   - **reply-to** the visitor's email, so pressing "Reply" answers the customer directly.
4. On success the page shows "Quote request received". If Resend rejects the message, the function returns an error and the button reads "Something went wrong — please try again". The error is logged in **Vercel → Project → Logs**.

Delivery goes straight to a Gmail address rather than to `info@`. Mail sent to `info@` passes through the Namecheap forwarder, which was unreliable for these messages.

Troubleshooting:
- Check Vercel function logs for `Resend error:`.
- Check the **Resend dashboard → Emails** for each message's status.
- Check the domain shows **Verified** in **Resend → Domains**.

## 4. How to edit content

All text is in `index.html`. Edit it in any text editor or directly on GitHub (open the file and click the pencil icon). Search for the text you want to change.

| Content | Where in `index.html` |
|---|---|
| Page title, search description, link-preview text | The `<title>`, `<meta name="description">`, `og:*` and `twitter:*` tags at the top of `<head>` |
| Hero headline and intro | `<section class="hero">` |
| "Subcontracting for" client names | `<div class="trusted">` |
| The four services | `<section id="services">` (each is a `service-card`) |
| Accreditations | `<section id="accreditations">` |
| Coverage | `<section id="coverage">` |
| Contact details / company number / address | `<section id="contact">` **and** the `<footer>` (update both) |
| Gallery photos | `<section id="gallery">`. Add or replace a file in `images/` and update both `data-src` and `src`. |
| Quote form "Type of work" options | `<select id="qType">` |

If a service is renamed, update it in **all** of these places: the service card, the hero intro, the footer line, the form dropdown, and the meta / og / twitter descriptions.

To change the link-preview image, replace `images/og-image.jpg` with a 1200×630 JPEG under about 300 KB. Alternatively, run `npm install` then `node scripts/make-og-image.mjs`. LinkedIn caches previews, so afterwards paste the URL into https://www.linkedin.com/post-inspector/ to refresh it.

## 5. How to redeploy

- **Normal way:** commit and push to `main` (or edit on GitHub and commit). Vercel builds and publishes automatically within about a minute.
- **Redeploy without a code change** (for example after changing an env var): open **Vercel → Project → Deployments**, open the menu on the latest production deployment and choose **Redeploy**.
- **Roll back:** in Deployments, open an earlier deployment and choose **Promote to Production** (or "Instant Rollback").
- **From the command line:** run `npx vercel --prod` from the repo folder (you need to be logged in to the Vercel account that owns the project).

## 6. DNS records

All records live in **Namecheap → Domain List → rviutility.co.uk → Advanced DNS**. Status below was checked against public DNS on 2026-11-16.

### Vercel (website)

| Type | Host | Value | Status |
|---|---|---|---|
| A | `@` | `216.198.79.1` (Vercel) | Present |
| CNAME | `www` | The value Vercel shows under **Project → Settings → Domains** for `www.rviutility.co.uk` | **Missing**. `www.rviutility.co.uk` does not resolve. Add the domain in Vercel, set it to redirect to `rviutility.co.uk`, then add this CNAME. |

### Resend (contact form email)

Use the exact values shown in **Resend → Domains → rviutility.co.uk**. The region in the MX value comes from there.

| Type | Host | Value | Status |
|---|---|---|---|
| TXT (DKIM) | `resend._domainkey` | `p=MIGfMA0…` (public key from Resend) | Present |
| TXT (SPF) | `send` | `v=spf1 include:amazonses.com ~all` | Present |
| MX | `send` | `feedback-smtp.<region>.amazonses.com`, priority 10 | **Missing.** Add it, then click "Verify" in Resend. |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none;` | Present. Optionally add `rua=mailto:<address>` to receive reports, and move to `p=quarantine` once mail is confirmed clean. |

### Email forwarding (info@) — do not remove

| Type | Host | Value |
|---|---|---|
| MX | `@` | `eforward1`–`eforward5.registrar-servers.com` (Namecheap forwarding) |
| TXT (SPF) | `@` | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |

## 7. Accounts to confirm are in the owner's name

- **GitHub:** the repo is under `rvichindris-pixel`.
- **Vercel:** confirm the project and the `rviutility.co.uk` domain sit in an account the owner controls, with billing in the owner's name.
- **Resend:** confirm the account holding the domain and `RESEND_API_KEY` belongs to the owner. If not, create an owner account, verify the domain there, issue a new key, update `RESEND_API_KEY` in Vercel and revoke the old key.
- **Namecheap:** confirm registrar login and renewal details are the owner's.
- Remove any developer access you no longer want: GitHub collaborators, Vercel team members, Resend team members.

## 8. Content to confirm with the owner

The accreditations section lists NRSWA Street Works, CSCS Cards, Public Liability Insurance ("Certificate available on request") and a Health & Safety Policy. Before relying on the site in tenders, confirm each one is current. Add specifics where helpful, such as the insurer and cover level, or scheme membership numbers (CHAS, Constructionline, SafeContractor).
