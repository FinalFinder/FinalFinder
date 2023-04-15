type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export default function Button(props: ButtonProps) {
  return (
    <button
      className="w-full rounded-md border-2 border-cyan-2 bg-cyan-1 px-5 py-3"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
