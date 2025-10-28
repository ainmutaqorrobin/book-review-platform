import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
export default function ReviewForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("reviewer_name", { required: true })} />
      <button type="submit">Submit</button>
    </form>
  );
}
