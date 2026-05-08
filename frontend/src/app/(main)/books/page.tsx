import { Suspense } from "react";
import BooksListPage from "@/components/book-list-page/book-list-page";
import BookSkeleton from "@/components/common/book-skeleton";

function BooksPageFallback() {
  return (
    <section className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">
          Books List
        </h1>
      </div>
      <BookSkeleton />
    </section>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksPageFallback />}>
      <BooksListPage />
    </Suspense>
  );
}
