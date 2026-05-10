import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { InlineProductCard } from '../../blog/components/InlineProductCard';

const ProductMentionView = ({ node, deleteNode }: any) => (
  <NodeViewWrapper className="product-mention-wrapper relative group">
    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={deleteNode}
        className="bg-farm-berry text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Видалити картку товару"
      >
        ✕
      </button>
    </div>
    <InlineProductCard productId={node.attrs.productId} />
  </NodeViewWrapper>
);

export const ProductMention = Node.create({
  name: 'productMention',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      productId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'product-mention',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['product-mention', mergeAttributes(HTMLAttributes, { 'data-product-id': HTMLAttributes.productId })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductMentionView);
  },
});
