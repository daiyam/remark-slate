import { serialize, defaultNodeTypes } from '../../src';

it('Serialize a single shortcode', () => {
  expect(
    serialize({
      children: [
        {
          type: defaultNodeTypes.shortcode,
          identifier: 'MailchimpForm',
          attributes: { id: 'chfk2' },
          children: [{ text: '' }]
        },
      ]
    } as any)
  ).toMatchSnapshot();
});

it('Serialize a single embed', () => {
  expect(
    serialize({
      children: [
        {
          type: defaultNodeTypes.embed,
          service: 'youtube',
          resource: 'YE7VzlLtp-4',
          children: [{ text: '' }]
        },
      ]
    } as any)
  ).toMatchSnapshot();
});
