import { deserialize } from '../../src';

it('Deserialize a leaf node with just underline', () => {
  expect(
    deserialize({
      type: 'paragraph',
      children: [
        {
          type: 'underline',
          children: [
            {
              value: 'Underline text',
            },
          ],
        },
      ],
    })
  ).toMatchSnapshot();
});
