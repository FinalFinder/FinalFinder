interface StudySessionProps {
  name: string;
  time: Date;
}

export default function StudySession(props: StudySessionProps) {
  return (
    <div className="my-2 w-full rounded-md bg-orange p-2" key={props.name}>
      <p className="font-bold">{props.name}</p>
      <p className="text-lg">
        {props.time.toDateString() + " @ " + props.time.toLocaleTimeString()}
      </p>
    </div>
  );
}
