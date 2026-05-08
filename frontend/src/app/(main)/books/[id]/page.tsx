import BookDetail from "@/components/common/book-detail";

interface IProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: IProps) {
  const { id } = await params;
  const bookId = Number(id);

  return <BookDetail bookId={bookId} />;
}
