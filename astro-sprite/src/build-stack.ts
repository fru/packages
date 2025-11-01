import { parse, stringify, type INode } from 'svgson';

export interface SVGContent {
  id: string;
  content: string;
}

export async function createSvg(icons: SVGContent[]): Promise<string> {
  const iconNodes: INode[] = await Promise.all(
    icons.map(async (icon) => {
      const node = await parse(icon.content);

      delete node.attributes.width;
      delete node.attributes.height;
      delete node.attributes.xmlns;
      delete node.attributes['xmlns:xlink'];

      node.attributes.id = icon.id;

      return node;
    }),
  );

  return stringify(node({
    ...root,
    children: [style, ...iconNodes],
  }));
}

const root: Partial<INode> = {
  name: 'svg',
  attributes: {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    class: 'root-svg-tag',
  },
};

const style: INode = node({
  name: 'style',
  attributes: { type: 'text/css' },
  children: [
    node({
      type: 'text',
      value: '.root-svg-tag > svg:not(:target) { display: none; }',
    }),
  ],
});

function node(node: Partial<INode>): INode {
  return {
    name: '',
    type: 'element',
    value: '',
    attributes: {},
    children: [],
    ...node,
  };
}
