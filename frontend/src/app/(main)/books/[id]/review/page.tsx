import ReviewForm from "@/components/form/review";

interface IProps {
  params: Promise<{ id: string }>;
}

async function Page({ params }: IProps) {
  const { id } = await params;

  return (
    <main>
      <ReviewForm bookId={id} />
    </main>
  );
}

export default Page;
