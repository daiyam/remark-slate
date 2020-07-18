import { serialize, defaultNodeTypes } from '../../src';

it('Serialize an underline paragraph from slate state to markdown', () => {
  expect(
    serialize({
      type: defaultNodeTypes.paragraph,
      children: [
        {
          underline: true,
          text: 'underline paragraph',
        },
      ],
    })
  ).toMatchSnapshot();
});
