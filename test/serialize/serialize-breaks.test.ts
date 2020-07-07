import { serialize, defaultNodeTypes } from '../../src';


it('Serialize a single paragraph', () => {
  expect(
    serialize({
      children: [
        {
          type: defaultNodeTypes.paragraph,
          children: [
            {
              text: 'Paragraph 1',
            }
          ]
        },
      ]
    } as any)
  ).toMatchSnapshot();
});

it('Serialize paragraphs with inline breaks results in spaces ', () => {
  expect(
    serialize({
      children: [
        {
          type: defaultNodeTypes.paragraph,
          children: [
            {
              text: 'Paragraph 1\nline 1.2',
            }
          ]
        },
        {
          type: defaultNodeTypes.paragraph,
          children: [
            {
              text: 'Paragraph 2\nline 2.2',
            }
          ]
        },
         {
          type: defaultNodeTypes.paragraph,
          children: [
            {
              text: 'Paragraph 3\nline 3.2',
            }
          ]
        },
      ]
    } as any)
  ).toMatchSnapshot();
});
