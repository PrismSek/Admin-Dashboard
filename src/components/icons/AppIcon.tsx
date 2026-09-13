import type { SVGProps } from "react";

import {
  APP_ICON_DEFINITIONS,
  type AppIconName,
} from "@/components/icons/app-icon-definitions";

export type AppIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: AppIconName;
  label?: string;
};

export function AppIcon({ name, label, ...props }: AppIconProps) {
  const definition = APP_ICON_DEFINITIONS[name];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox={definition.viewBox}
      fill="currentColor"
      focusable="false"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {definition.body.map((shape, index) =>
        shape.kind === "path" ? (
          <path
            key={`${name}-path-${index}`}
            d={shape.d}
            fill={shape.fill ?? "currentColor"}
            fillRule={shape.fillRule}
            clipRule={shape.clipRule}
          />
        ) : (
          <circle
            key={`${name}-circle-${index}`}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            fill={shape.fill ?? "currentColor"}
          />
        ),
      )}
    </svg>
  );
}

export type { AppIconName } from "@/components/icons/app-icon-definitions";
