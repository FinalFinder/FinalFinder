interface ExamProps {
  name: string;
  date: Date;
}

export default function Exam(props: ExamProps) {
  return (
    <div className="my-2 w-full rounded-md bg-blue p-2" key={props.name}>
      <p className="font-bold">{props.name}</p>
      <p className="text-lg">{props.date.toDateString()}</p>
    </div>
  );
}
