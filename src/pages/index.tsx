import Image from "next/image";

import Button from "@/components/Button";
import dino from "public/dino.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start">
      <div className="mb-10 flex max-w-xs flex-col items-center justify-start">
        <p className="text-center text-xl font-bold">Don't study alone.</p>
        <p className="py-2 text-center text-lg">
          Work with other Hack Clubbers taking similar exams so that you can be
          prepared for exam day.
        </p>
        <div className="mt-2 w-5/6">
          <Button
            onClick={() => {
              // Link to slack auth
            }}
          >
            <p className="text-lg">Start Studying</p>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start">
        <Image src={dino} alt="A dinosaur studying" />
        <a
          className="italic underline"
          href="https://github.com/hackclub/dinosaurs/blob/main/Zeo_shark_study_dino.png"
        >
          A drawing of Orpheus studying by Zeo-shark
        </a>
      </div>
    </div>
  );
}
