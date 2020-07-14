import { deserialize } from '../../src';

it('deserialize generic shortcode', () => {
  expect(
    deserialize({
      type: 'shortcode',
      identifier: 'MailchimpForm',
      attributes: { id: 'chfk2' }
    })
  ).toMatchSnapshot();
});

it('deserialize youtube embed', () => {
  expect(
    deserialize({
      type: 'shortcode',
      identifier: 'youtube',
      attributes: { id: 'YE7VzlLtp-4' }
    })
  ).toMatchSnapshot();
});
