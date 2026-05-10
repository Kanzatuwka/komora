import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';
import { InlineProductCard } from './InlineProductCard';

interface ArticleBodyProps {
  content: string;
}

export function ArticleBody({ content }: ArticleBodyProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'product-mention') {
        const productId = domNode.attribs['data-product-id'];
        return <InlineProductCard productId={productId} />;
      }
    }
  };

  return (
    <div className="prose prose-lg max-w-none prose-stone prose-headings:text-farm-green prose-a:text-farm-berry overflow-hidden mb-24 font-serif leading-relaxed">
      {parse(content, options)}
    </div>
  );
}
