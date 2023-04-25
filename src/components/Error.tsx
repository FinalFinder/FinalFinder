interface ErrorProps {
  error: string;
  message: string;
}

export default function ErrorComponent(props: ErrorProps) {
  return (
    <p className="m-2 rounded-md bg-red-600 p-2 text-2xl">
      Uh oh, there was an error {props.error}. Please try refreshing. If the
      issue persists,{" "}
      <a
        href="https://github.com/polypixeldev/FinalFinder/issues/new"
        target="_blank"
        className="text-white underline"
      >
        file an issue on our GitHub
      </a>{" "}
      and include the following error message: <br />
      <code className="mt-2 block w-full rounded-md bg-gray-2 p-1 text-white">
        {props.message}
      </code>
    </p>
  );
}
