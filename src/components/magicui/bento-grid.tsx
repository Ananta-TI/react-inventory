import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ComponentPropsWithoutRef, ReactNode } from "react";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className?: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
  iconColor?: string;
}

const BentoGrid = ({ children, className = "", ...props }: BentoGridProps) => {
  return (
    <div
      className={`grid w-full auto-rows-[22rem] grid-cols-3 gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className = "",
  background,
  Icon,
  description,
  href,
  cta,
  iconColor = "text-neutral-700", // default warna
  ...props
}: BentoCardProps) => (
  <div
    className={`group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl
      bg-background shadow-md dark:bg-background dark:border dark:border-white/10 dark:shadow-[inset_0_-20px_80px_-20px_rgba(255,255,255,0.1)]
      ${className}`}
    {...props}
  >
    <div>{background}</div>
    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
<Icon className={`h-12 w-12 origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-75 ${iconColor}`} />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </div>

      <div className="lg:hidden pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <a
          href={href}
          className="pointer-events-auto text-blue-500 hover:underline text-sm font-medium flex items-center gap-1"
        >
          {cta}
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </div>

    <div className="hidden lg:flex pointer-events-none absolute bottom-0 w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <a
        href={href}
        className="pointer-events-auto text-blue-500 hover:underline text-sm font-medium flex items-center gap-1"
      >
        {cta}
        <ArrowRightIcon className="h-4 w-4" />
      </a>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

export { BentoCard, BentoGrid };
