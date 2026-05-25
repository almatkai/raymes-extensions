import { Action, Icon } from "@raycast/api";
import { Svg } from "../../type";
import { fetchAndCopySvgImage } from "../../utils/fetch";
import { useSvglExtension } from "../app-context";

const CopySvgImageActions = ({ svg }: { svg: Svg }) => {
  const { addRecentSvgId } = useSvglExtension();

  const handleAction = (url: string, showContent: string, fileName: string) => {
    addRecentSvgId(svg.id);
    fetchAndCopySvgImage(url, showContent, fileName);
  };

  if (typeof svg.route === "string") {
    return (
      <Action
        icon={Icon.Image}
        title="Copy as Image"
        onAction={() => handleAction(svg.route as string, "Copied image to clipboard", svg.title)}
      />
    );
  }

  const route = svg.route;

  return (
    <>
      <Action
        icon={Icon.Image}
        title="Copy Light as Image"
        onAction={() => handleAction(route.light, "Copied light image to clipboard", `${svg.title}-light`)}
      />
      <Action
        icon={Icon.Image}
        title="Copy Dark as Image"
        onAction={() => handleAction(route.dark, "Copied dark image to clipboard", `${svg.title}-dark`)}
      />
    </>
  );
};

export default CopySvgImageActions;
