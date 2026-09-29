/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "category",
      label: "Introduction",
      link: {
        type: "doc",
        id: "introduction/get-started",
      },
      items: ["introduction/development", "introduction/contributing"],
    },
    {
      type: "category",
      label: "Codebase",
      items: ["codebase/json-schema", "codebase/frames"],
    },
    {
      type: "category",
      label: "@mosaic/mosaic",
      collapsed: false,
      items: [
        "@mosaic/mosaic/installation",
        "@mosaic/mosaic/integration",
        "@mosaic/mosaic/customizing-styles",
        {
          type: "category",
          label: "API",
          link: {
            type: "doc",
            id: "@mosaic/mosaic/api/api-intro",
          },
          items: [
            {
              type: "category",
              label: "Props",
              link: {
                type: "doc",
                id: "@mosaic/mosaic/api/props/props",
              },
              items: [
                "@mosaic/mosaic/api/props/initialdata",
                "@mosaic/mosaic/api/props/mosaic-api",
                "@mosaic/mosaic/api/props/render-props",
                "@mosaic/mosaic/api/props/ui-options",
              ],
            },
            {
              type: "category",
              label: "Children Components",
              link: {
                type: "doc",
                id: "@mosaic/mosaic/api/children-components/children-components-intro",
              },
              items: [
                "@mosaic/mosaic/api/children-components/main-menu",
                "@mosaic/mosaic/api/children-components/welcome-screen",
                "@mosaic/mosaic/api/children-components/sidebar",
                "@mosaic/mosaic/api/children-components/footer",
                "@mosaic/mosaic/api/children-components/live-collaboration-trigger",
              ],
            },
            {
              type: "category",
              label: "Utils",
              link: {
                type: "doc",
                id: "@mosaic/mosaic/api/utils/utils-intro",
              },
              items: [
                "@mosaic/mosaic/api/utils/export",
                "@mosaic/mosaic/api/utils/restore",
              ],
            },
            "@mosaic/mosaic/api/constants",
            "@mosaic/mosaic/api/mosaic-element-skeleton",
          ],
        },
        "@mosaic/mosaic/faq",
        "@mosaic/mosaic/development",
      ],
    },
    {
      type: "category",
      label: "@excalidraw/mermaid-to-excalidraw",
      link: {
        type: "doc",
        id: "@mosaic/mermaid-to-excalidraw/installation",
      },
      items: [
        "@mosaic/mermaid-to-excalidraw/api",
        "@mosaic/mermaid-to-excalidraw/development",
        {
          type: "category",
          label: "Codebase",
          link: {
            type: "doc",
            id: "@mosaic/mermaid-to-excalidraw/codebase/codebase",
          },
          items: [
            {
              type: "category",
              label: "How Parser works under the hood?",
              link: {
                type: "doc",
                id: "@mosaic/mermaid-to-excalidraw/codebase/parser/parser",
              },
              items: [
                "@mosaic/mermaid-to-excalidraw/codebase/parser/flowchart",
              ],
            },
            "@mosaic/mermaid-to-excalidraw/codebase/new-diagram-type",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
