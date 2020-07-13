import { serialize, defaultNodeTypes } from '../../src';

it('Serialize a link from slate state to markdown', () => {
  expect(
    serialize({
      type: defaultNodeTypes.link,
      url: 'https://jackhanford.com',
      children: [
        {
          text: 'Personal website',
        },
      ],
    })
  ).toMatchSnapshot();
});
