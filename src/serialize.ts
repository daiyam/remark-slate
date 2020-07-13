import escapeHtml from 'escape-html';
import striptags from 'striptags';

import { defaultNodeTypes, NodeTypes } from './deserialize';

export interface LeafType {
  text: string;
  strikeThrough?: boolean;
  bold?: boolean;
  italic?: boolean;
  parentType?: string;
}

export interface BlockType {
  type: string;
  parentType?: string;
  url?: string;
  break?: boolean;
  children: Array<BlockType | LeafType>;
}

interface Options {
  nodeTypes?: NodeTypes;
  listDepth?: number;
  ignoreParagraphNewline?: boolean;
  stripTags?: boolean;
  allowedTags?: Array<string>;
  tagReplacement?: string;
}

const isBlockNode = (node: BlockType | LeafType): node is BlockType => {
  return Array.isArray((node as BlockType).children);
};

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return typeof (node as LeafType).text === 'string';
};

const BREAK_TAG = '<br>';

export default function serialize(
  chunk: BlockType | LeafType,
  opts: Options = {},
  topNL: boolean = false
) {
  const {
    nodeTypes: userNodeTypes = defaultNodeTypes,
    ignoreParagraphNewline = false,
    allowedTags = [],
    tagReplacement = ''
  } = opts;

  let {
    listDepth = 0,
  } = opts

  let text = (chunk as LeafType).text || '';
  let type = (chunk as BlockType).type || '';

  const nodeTypes = {
    ...defaultNodeTypes,
    ...userNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...userNodeTypes.heading,
    },
  };

  let children = text;

  if (isBlockNode(chunk)) {
    const LIST_TYPES = [nodeTypes.ul_list, nodeTypes.ol_list];

    if(!type) {
      --listDepth;
    }

    children = chunk.children
      .map((c: BlockType | LeafType, i: number) => {
        const isList = !isLeafNode(c)
          ? LIST_TYPES.includes(c.type || '')
          : false;

        const selfIsList = LIST_TYPES.includes(chunk.type || '');

        // Links can have the following shape
        // In which case we don't want to surround
        // with break tags
        // {
        //  type: 'paragraph',
        //  children: [
        //    { text: '' },
        //    { type: 'link', children: [{ text: foo.com }]}
        //    { text: '' }
        //  ]
        // }
        const childrenHasLink = chunk.children.some(
          (f) => !isLeafNode(f) && f.type === nodeTypes.link
        );

        return serialize(
          { ...c, parentType: type },
          {
            nodeTypes,
            stripTags: opts.stripTags,
            allowedTags,
            tagReplacement,
            // WOAH.
            // what we're doing here is pretty tricky, it relates to the block below where
            // we check for ignoreParagraphNewline and set type to paragraph.
            // We want to strip out empty paragraphs sometimes, but other times we don't.
            // If we're the descendant of a list, we know we don't want a bunch
            // of whitespace. If we're parallel to a link we also don't want
            // to respect neighboring paragraphs
            ignoreParagraphNewline:
              (ignoreParagraphNewline ||
                isList ||
                selfIsList ||
                childrenHasLink) &&
              // if we have c.break, never ignore empty paragraph new line
              !(c as BlockType).break,

            // track depth of nested lists so we can add proper spacing
            listDepth: LIST_TYPES.includes((c as BlockType).type || '')
              ? listDepth + 1
              : listDepth,
          },
          /* !(!type && i === 0) */
          // !(isList || (!type && i === 0))
          i !== 0
        );
      })
      .join('');
  }

  // This is pretty fragile code, check the long comment where we iterate over children
  if (
    !ignoreParagraphNewline &&
    (text === '' || text === '\n') &&
    chunk.parentType === nodeTypes.paragraph &&
    (chunk as BlockType).break
  ) {
    type = 'paragraph';
    children = BREAK_TAG;
    topNL = false
  }

  if (children === '') return;

  // Never allow decorating break tags with rich text formatting,
  // this can malform generated markdown
  // Also ensure we're only ever applying text formatting to leaf node
  // level chunks, otherwise we can end up in a situation where
  // we try applying formatting like to a node like this:
  // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
  // which is invalid markup and can mess everything up
  if (children !== BREAK_TAG && isLeafNode(chunk)) {
    if (chunk.bold && chunk.italic) {
      children = retainWhitespaceAndFormat(children, '***');
    } else {
      if (chunk.bold) {
        children = retainWhitespaceAndFormat(children, '**');
      }

      if (chunk.italic) {
        children = retainWhitespaceAndFormat(children, '_');
      }
    }

    if (chunk.strikeThrough) {
      children = `~~${children}~~`;
    }
  }

  switch (type) {
    case nodeTypes.heading[1]:
      return `${printNewBlock(topNL)}# ${children}\n`;
    case nodeTypes.heading[2]:
      return `${printNewBlock(topNL)}## ${children}\n`;
    case nodeTypes.heading[3]:
      return `${printNewBlock(topNL)}### ${children}\n`;
    case nodeTypes.heading[4]:
      return `${printNewBlock(topNL)}#### ${children}\n`;
    case nodeTypes.heading[5]:
      return `${printNewBlock(topNL)}##### ${children}\n`;
    case nodeTypes.heading[6]:
      return `${printNewBlock(topNL)}###### ${children}\n`;

    case nodeTypes.block_quote:
      // For some reason, marked is parsing blockquotes w/ one new line
      // as contiued blockquotes, so adding two new lines ensures that doesn't
      // happen
      return `${printNewBlock(topNL)}> ${children}\n`;

    case nodeTypes.link:
      return `[${children}](${(chunk as BlockType).url || ''})`;

    case nodeTypes.ul_list:
    case nodeTypes.ol_list:
      return `${printNewBlock(topNL)}${children}\n`;

    case nodeTypes.listItem:
      const isOL = chunk && chunk.parentType === 'ol_list';

      let spacer = '';
      for (let k = 0; listDepth > k; k++) {
        if (isOL) {
          // https://github.com/remarkjs/remark-react/issues/65
          spacer += '   ';
        } else {
          spacer += '  ';
        }
      }
      return `${spacer}${isOL ? '1.' : '-'} ${children}`;

    case nodeTypes.paragraph:
      return `${printNewBlock(topNL)}${children}\n`;

    default:
      if(isLeafNode(chunk)) {
        if(opts.stripTags) {
          if(allowedTags.length === 0) {
            // don't escape quotes since no tags are allowed
            return striptags(children, allowedTags, tagReplacement);
          }
          else {
            return escapeHtml(striptags(children, allowedTags, tagReplacement));
          }
        }
        else {
          return escapeHtml(children);
        }
      }
      else {
        return children;
      }
  }
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
function retainWhitespaceAndFormat(string: string, format: string) {
  // we keep this for a comparison later
  const frozenString = string.trim();

  // children will be mutated
  let children = frozenString;

  const fullFormat = `${format}${children}${format}`;

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat;
  }

  // if we do have whitespace, let's add our formatting
  // around our trimmed string
  const formattedString = format + children + format;

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString);
}

function printNewBlock(top: boolean): string {
  if(top) {
    return '\n'
  }
  else {
    return ''
  }
}
