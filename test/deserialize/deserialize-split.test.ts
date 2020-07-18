import unified from 'unified';
import markdown from 'remark-parse';
import plugin from '../../src';

/* it('Deserialize a bold paragraph with a continuous split', () => {
  unified()
    .use(markdown)
    .use(plugin)
    .process('**bold para****graph**', (_, file) => {
      //@ts-ignore ts doesn't know about file.result
      const res = file.result;
      expect(res).toMatchSnapshot();
    })
}); */

it('Deserialize a bold paragraph splitted by a space', () => {
  unified()
    .use(markdown)
    .use(plugin)
    .process('**bold** **paragraph**', (_, file) => {
      //@ts-ignore ts doesn't know about file.result
      const res = file.result;
      expect(res).toMatchSnapshot();
    })
});
