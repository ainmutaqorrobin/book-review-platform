import BookForm from "@/components/form/book";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;

  return (
    <main>
      <BookForm mode="edit" bookId={Number(id)} />
    </main>
  );
}
