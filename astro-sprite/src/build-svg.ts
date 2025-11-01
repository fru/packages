import { parse, stringify, type INode } from 'svgson';

export interface SVGIconContent {
  id: string;
  content: string;
}

type SvgGroupType = 'sprite' | 'stack';

export async function buildSvgGroup(type: SvgGroupType, icons: SVGIconContent[]): Promise<string> {
  const nodes: INode[] = await Promise.all(
    icons.map(async (icon) => {
      const node = await parse(icon.content);
      if (type === 'sprite') node.name = 'symbol';
      return modifyAttributes(node, icon.id);
    }),
  );

  const children = type === 'sprite' ? nodes : [style, ...nodes];
  return stringify(node({ ...root, children }));
}

function modifyAttributes(node: INode, id: string) {
  delete node.attributes.width;
  delete node.attributes.height;
  delete node.attributes.xmlns;
  delete node.attributes['xmlns:xlink'];

  node.attributes.id = id;
  return node;
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
