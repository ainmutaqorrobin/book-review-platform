# Book Review Platform — Frontend

The frontend client for the Book Review Platform. Built with Next.js (App Router) + React + TypeScript, this UI connects to the backend API and provides a rich user experience, including debounced search, form validation, toast notifications, custom hooks, and modern UI components.

---

## 🔍 Route Overview (Next.js App Router)

Based on your folder structure (`/frontend/src/app/`), the main routes include:

- `/` — Landing (home) page
- `/books` — Books list page
- `/books/[id]` — Book detail page
- `/books/[id]/review` — Submit review page
- `/create-book` — Create a book page
- Additional UI components and utility routes/hooks are in `/components/`, `/hooks/`, `/utils/`, and `/lib/`

---

## 🧠 Key Features

- ✅ **Debounced Search**: A search bar that delays API calls until the user pauses typing, reducing backend load and improving UX.
- ✅ **Form Validation**: Built with React Hook Form + custom UI components (Shadcn UI) so that forms (e.g., review submission, book creation) enforce correct input.
- ✅ **Toast Notifications**: Instant feedback to the user (success, error, loading) using a toast library integrated into Next.js App Router.
- ✅ **Custom Hooks**: Encapsulate logic like fetching books, managing search state, or refreshing data so your components stay clean.
- ✅ **Loading Skeletons & Icons**: While fetching data (books, book details, reviews) a skeleton or loading spinner is shown to keep UI responsive and visually smooth.
- ✅ **Pretty Layout / UI**: Tailwind CSS + Shadcn UI ensures consistent styling, responsive design, and modern look & feel.
- ✅ **App Router**: Utilizes Next.js App Router architecture for nested layouts, server and client components, and route-based data fetching.
