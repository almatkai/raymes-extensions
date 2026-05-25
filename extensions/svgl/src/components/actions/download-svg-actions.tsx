import { Action, Icon } from "@raycast/api";
import { Svg } from "../../type";
import { fetchAndDownloadSvg } from "../../utils/fetch";
import { useSvglExtension } from "../app-context";

const DownloadSvgActions = ({ svg }: { svg: Svg }) => {
  const { addRecentSvgId } = useSvglExtension();

  const handleAction = (url: string, showContent: string, fileName: string) => {
    addRecentSvgId(svg.id);
    fetchAndDownloadSvg(url, showContent, fileName);
  };

  if (typeof svg.route === "string") {
    return (
      <Action
        icon={Icon.Download}
        title="Download SVG"
        onAction={() => handleAction(svg.route as string, "Downloaded SVG", svg.title)}
      />
    );
  }

  const route = svg.route;

  return (
    <>
      <Action
        icon={Icon.Download}
        title="Download Light SVG"
        onAction={() => handleAction(route.light, "Downloaded light SVG", `${svg.title}-light`)}
      />
      <Action
        icon={Icon.Download}
        title="Download Dark SVG"
        onAction={() => handleAction(route.dark, "Downloaded dark SVG", `${svg.title}-dark`)}
      />
    </>
  );
};

export default DownloadSvgActions;
