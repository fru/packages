# Features

## Resumability & Serialization

[Awesome feature of qwik](https://qwik.dev/docs/concepts/think-qwik/)

## [Updating Attr on host element](https://fast.design/docs/advanced/working-with-custom-elements#updating-attributes-on-the-host-element)

Cool example:

```ts
const template = html<MyProgress>`
  <template role="progressbar" $aria-valuenow="{value}" $aria-valuemin="{min}" $aria-valuemax="{max}"></template>
`;
```

## Real world component examples:

[real-world-recipes/product-catalog](https://docs.aurelia.io/templates/real-world-recipes/product-catalog)

## [custom-elements.json](https://wc-toolkit.com/integrations/web-components-language-server/)

Together with the "wc-toolkit.web-components-language-server" extension, the following also works in markdown etc.

Havent gotten the "customElements" field in the package.json to work yet.

```json {projectRootFolder}/custom-elements.json
{
  "$schema": "https://raw.githubusercontent.com/webcomponents/custom-elements-manifest/main/schema.json",
  "schemaVersion": "1.0.0",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "example.ts",
      "declarations": [
        {
          "kind": "class",
          "name": "TestTag",
          "tagName": "test-tag3",
          "customElement": true,
          "description": "A test custom element",
          "attributes": [
            {
              "name": "attr3",
              "description": "Main attribute with predefined options",
              "type": {
                "text": "'option-a' | 'option-b'"
              },
              "default": "'option-a'"
            }
          ],
          "slots": [
            {
              "name": "",
              "description": "Default slot for content"
            }
          ]
        }
      ]
    }
  ]
}
```

An alternative could be vscode custom data:

This worked in html but not in markdown.

```jsonc .vscode/settings.json
{
  // HTML Custom Elements
  "html.suggest.html5": true,
  "html.validate.scripts": true,
  "html.validate.styles": true,
  "typescript.suggest.completeJSDocs": true,
  "html.customData": ["./site/shared/btld-elements/vscode-html-custom-data.json"],
  "css.customData": [],
}
```

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/main/docs/customData.schema.json",
  "version": 1.1,
  "tags": [
    {
      "name": "test-tag",
      "description": "A test custom element",
      "attributes": [
        {
          "name": "attr",
          "description": "Main attribute with predefined options",
          "values": [
            {
              "name": "option-a"
            },
            {
              "name": "option-b"
            }
          ]
        }
      ]
    }
  ],
  "globalAttributes": [],
  "valueSets": []
}
```
