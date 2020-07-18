import { serialize, defaultNodeTypes } from '../../src';

it('Serialize a bold paragraph with a continuous split', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          bold: true,
          text: 'bold para',
        },
        {
          bold: true,
          text: 'graph',
        },
      ],
    })
  ).toMatchSnapshot();
});

it('Serialize a bold paragraph splitted by a space', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          bold: true,
          text: 'bold',
        },
        {
          text: ' ',
        },
        {
          bold: true,
          text: 'paragraph',
        },
      ],
    })
  ).toMatchSnapshot();
});

it('Serialize a bold paragraph splitted by an italic word without spaces', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          bold: true,
          text: 'bold and ',
        },
        {
          bold: true,
          italic: true,
          text: 'italic',
        },
        {
          bold: true,
          text: ' paragraph',
        },
      ],
    })
  ).toMatchSnapshot();
});

it('Serialize a bold paragraph splitted by an italic word with spaces', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          bold: true,
          text: 'bold and',
        },
        {
          bold: true,
          italic: true,
          text: ' italic ',
        },
        {
          bold: true,
          text: 'paragraph',
        },
      ],
    })
  ).toMatchSnapshot();
});

it('Serialize a bold paragraph splitted by an italic word no spaces at all', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          bold: true,
          text: 'bold and',
        },
        {
          bold: true,
          italic: true,
          text: 'italic',
        },
        {
          bold: true,
          text: 'paragraph',
        },
      ],
    })
  ).toMatchSnapshot();
});
