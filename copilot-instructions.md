# Massage2Wellness – Copilot Instructions

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (no frameworks)
- **Auth**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore
- **Hosting**: Firebase Hosting via GitHub Actions CI/CD

## Pages

| File                 | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `index.html`         | Public landing page                                       |
| `services.html`      | Services & pricing                                        |
| `about.html`         | About page                                                |
| `contact.html`       | Contact form + FAQ                                        |
| `booking.html`       | 4-step booking flow                                       |
| `login.html`         | Role-based login (client / admin) + registration          |
| `client-portal.html` | Client appointment dashboard                              |
| `admin.html`         | Admin dashboard (bookings, customers, messages, settings) |

## Script responsibilities

| Script                | Responsibility                                                       |
| --------------------- | -------------------------------------------------------------------- |
| `firebase-config.js`  | Initialise Firebase; export `db` and `auth` to `window`              |
| `firebase-service.js` | All Firestore CRUD and Firebase Auth methods                         |
| `firebase-booking.js` | `saveBooking` + `getAvailableTimeSlots` with localStorage fallback   |
| `components.js`       | Fetch-inject shared nav/footer; auth-aware nav state                 |
| `main.js`             | Scroll animations, navbar scroll, shared `showMessage`/`showLoading` |
| `booking.js`          | 4-step booking form logic                                            |
| `login.js`            | Firebase Auth sign-in/register; `UserSession` helper class           |
| `client-portal.js`    | Client appointment list, dashboard stats, profile save               |
| `admin.js`            | Tab navigation with `history.pushState`, Firestore admin data        |
| `contact.js`          | Contact form submission; FAQ accordion                               |

## Conventions

- Use `async/await` for all Firebase calls; never mix `.then()/.catch()`
- CSS custom properties (`--primary-color` etc.) defined in `:root` — never hard-code colour values in JS
- Validate at the system boundary (form submit) only
- Component HTML lives in `components/nav.html` and `components/footer.html`
- Firestore Timestamps must be converted via `.toDate()` before passing to `new Date()`
