import ReviewForm from "@/components/form/review";

interface IProps {
  params: Promise<{ id: string }>;
}

export default async function CreateReviewPage({ params }: IProps) {
  const { id } = await params;

  return (
    <main>
      <ReviewForm bookId={id} />
    </main>
  );
}
