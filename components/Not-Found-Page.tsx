import Link from "next/link";
import { Button } from "./ui/button";

export function NotFoundPage() {
  return (
    <div className=" ">
      <div className="container mx-auto px-4 py-8 mb-50">
        <div className="flex flex-col items-center">
          {/* <div className="z-10 flex size-[90px] items-center justify-center rounded-3xl border  font-semibold text-2xl text-muted-foreground tracking-tight shadow-lg md:size-[100px] md:text-3xl">
            404
          </div> */}

          <div className="h-8" />

          <p className="text-center font-bold text-3xl tracking-tighter md:text-5xl">
            <span className="block"> Uh oh. </span>
            <span className="block">Looks like you&lsquo;re lost!</span>
          </p>

          <div className="h-12" />

          <div>
            <p className="text-center text-muted-foreground text-xl leading-7">
              Find live content on our{" "}
              <Link
                href="/"
                className="text-foreground hover:underline"
              >
                <Button className="cursor-pointer" variant="outline">HOMEPAGE</Button>
             
              </Link>
             
            </p>
          </div>

          <Aurora
            color="hsl(var(--foreground)/8%)"
            pos={{ top: "40%", left: "50%" }}
            size={{ width: "100vw", height: "100vh" }}
          />
        </div>
      </div>
    </div>
  );
}

type AuroraProps = {
  size: { width: string; height: string };
  pos: { top: string; left: string };
  color: string;
};

const Aurora: React.FC<AuroraProps> = ({ color, pos, size }) => {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: pos.top,
        left: pos.left,
        width: size.width,
        height: size.height,
        transform: "translate(-50%, -50%)",
        backgroundImage: `radial-gradient(ellipse at center, ${color}, transparent 60%)`,
      }}
    />
  );
};
