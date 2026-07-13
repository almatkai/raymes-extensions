import { Detail } from "@raycast/api";
import { ComponentProps } from "react";
import { HistoryColor } from "../lib/types";

type ColorWheelDetailProps = ComponentProps<typeof Detail> & {
  initialColor?: HistoryColor;
};

export function ColorWheelPreview({ initialColor }: { initialColor?: HistoryColor }) {
  const props: ColorWheelDetailProps = {
    markdown: "![RGB Color Wheel](rgb-color-wheel.webp?&raycast-height=350)",
    initialColor,
  };
  return <Detail {...props} />;
}
