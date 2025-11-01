import type { IconifyJSON } from "@iconify/types";
import { getIconData, iconToHTML, iconToSVG } from "@iconify/utils";

export function buildIconifyResolver(familieName: string, familyDefinition: IconifyJSON) {
  return (icons: string[]) => {
    return icons
      .map((icon) => buildIconifySvg(familieName, icon, familyDefinition))
      .filter(x => x !== undefined);
  };
}

function buildIconifySvg(family: string, icon: string, familyDefinition: IconifyJSON) {
  const data = getIconData(familyDefinition, icon);
  if (!data) return;

  const { body, attributes } = iconToSVG(data);
  const content = iconToHTML(body, attributes);
  return { id: family + '--' + icon, content };
}