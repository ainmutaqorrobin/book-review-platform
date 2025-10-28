import { getBooks } from "@/utils/api/books";

export default async function Page() {
  const res = await getBooks();
  const books = res.data;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Books</h1>

      {books.length === 0 ? (
        <p className="text-gray-500">
          {res.success
            ? "No books available."
            : "Backend not reachable. Showing empty list."}
        </p>
      ) : (
        books.map((b) => (
          <div
            key={b.id}
            className="p-4 border rounded mb-2 hover:bg-gray-50 transition"
          >
            <h2 className="font-medium">{b.title}</h2>
            <p className="text-gray-600">{b.author}</p>
          </div>
        ))
      )}
    </main>
  );
}
