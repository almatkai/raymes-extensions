import { AI, Action, ActionPanel, Grid, Icon, Keyboard, LaunchProps, showToast } from "@raycast/api";
import { showFailureToast, useAI } from "@raycast/utils";
import { useEffect } from "react";
import { ColorWheelPreview } from "./components/ColorWheelPreview";
import CopyAsSubmenu from "./components/CopyAsSubmenu";
import { addColorsToHistory, addToHistory, useHistory } from "./lib/history";
import { getFormattedColor, getPreviewColor } from "./lib/utils";

export default function GenerateColors(props: LaunchProps<{ arguments: Arguments.GenerateColors }>) {
  const { addToFavorites, isFavorite, removeFromFavorites } = useHistory();
  const { data, isLoading } = useAI(
    `Generate colors based on a prompt.

Please follow these rules:
- You MUST return an JSON array of HEX colors without any other characters. It should be PARSABLE and MINIFIED.
- Return an empty JSON array if it's not possible to generate colors.

Examples:
- ["#66D3BB","#7EDDC6","#96E7D1","#AEEFDB","#C6F9E6"]
- ["#0000CD","#0000FF","#1E90FF"]
- ["#FF0000","#FF6347","#FF7F50","#FF8C00","#FFA07A","#FFA500","#FFD700","#FFDEAD","#FFE4B5","#FFE4C4"]

Prompt: ${props.arguments.prompt}
JSON colors:`,
    {
      model: AI.Model["OpenAI_GPT-5_mini"],
      stream: false,
    },
  );

  let colors: string[] = [];
  try {
    colors = data ? (JSON.parse(data) as string[]) : [];
  } catch (error) {
    showFailureToast(error, { title: "Could not generate colors, please try again." });
  }

  useEffect(() => {
    if (colors.length > 0) addColorsToHistory(colors);
  }, [data]);

  return (
    <Grid columns={5} isLoading={isLoading}>
      {colors.map((c, index) => {
        const formattedColor = getFormattedColor(c);
        const previewColor = getPreviewColor(c);
        const color = { light: previewColor, dark: previewColor, adjustContrast: false };
        const favorite = isFavorite(formattedColor);
        return (
          <Grid.Item
            key={index}
            content={{ color }}
            title={formattedColor}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={formattedColor} onCopy={() => addToHistory(formattedColor)} />
                <Action.Paste content={formattedColor} onPaste={() => addToHistory(formattedColor)} />
                <CopyAsSubmenu color={formattedColor} onCopy={() => addToHistory(formattedColor)} />
                <Action.Push
                  title="Open in Color Wheel"
                  icon={Icon.CircleProgress100}
                  target={<ColorWheelPreview initialColor={formattedColor} />}
                />
                <Action
                  title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                  icon={favorite ? Icon.StarDisabled : Icon.Star}
                  shortcut={Keyboard.Shortcut.Common.Pin}
                  onAction={async () => {
                    if (favorite) {
                      await removeFromFavorites(formattedColor);
                      await showToast({ title: "Removed from favorites", message: formattedColor });
                    } else {
                      await addToFavorites(formattedColor);
                      await showToast({ title: "Added to favorites", message: formattedColor });
                    }
                  }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </Grid>
  );
}
