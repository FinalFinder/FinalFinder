import { useRouter } from "next/router";

interface ExamProps {
  name: string;
  slug: string;
  date: Date;
  clickable?: boolean;
}

export default function Exam(props: ExamProps) {
  const router = useRouter();

  return (
    <div
      className="my-2 w-full rounded-md bg-blue p-2"
      style={{
        cursor: props.clickable ? "pointer" : "default",
      }}
      key={props.name}
      onClick={
        props.clickable
          ? () => {
              router.push(`/exams/${props.slug}`);
            }
          : undefined
      }
    >
      <p className="font-bold">{props.name}</p>
      <p className="text-lg">{props.date.toDateString()}</p>
    </div>
  );
}
