import assert from 'assert';
import { SiritoriBot } from '../src/lib/SiritoriBot';

describe('SiritoriBot', () => {
  describe('#answer()', () => {
    it('最後の文字から始まる単語があると続く', () => {
      const wordList = [
        { name: 'りんご', kana: 'りんご' },
        { name: 'ゴリラ', kana: 'ごりら' },
      ];
      const bot = new SiritoriBot(wordList);
      const state = bot.answer('りんご');
      assert.deepStrictEqual(state, { type: 'continued', word: wordList[1] });
    });

    it('「ん」で終わる単語しかなくなると勝つ', () => {
      const wordList = [
        { name: 'くるみ', kana: 'くるみ' },
        { name: 'みかん', kana: 'みかん' },
      ];
      const bot = new SiritoriBot(wordList);
      const state = bot.answer('くるみ');
      assert.deepStrictEqual(state, { type: 'ended', winner: 'user' });
    });

    it('「ん」で終わる単語を答えると負ける', () => {
      const wordList = [{ name: 'みかん', kana: 'みかん' }];
      const bot = new SiritoriBot(wordList);
      const state = bot.answer('みかん');
      assert.deepStrictEqual(state, { type: 'ended', winner: 'bot' });
    });

    it('知らない単語を答えると違反になる', () => {
      const bot = new SiritoriBot([]);
      const state = bot.answer('りんご');
      assert.deepStrictEqual(state, { type: 'violated', reason: 'unknown' });
    });

    it('すでに使われた単語を答えると違反になる', () => {
      const wordList = [{ name: '新聞紙', kana: 'しんぶんし' }];
      const bot = new SiritoriBot(wordList);
      bot.answer();
      const state = bot.answer('新聞紙');
      assert.deepStrictEqual(state, { type: 'violated', reason: 'duplicated' });
    });

    it('最後の文字から始まらない単語を答えると違反になる', () => {
      const wordList = [
        { name: 'りんご', kana: 'りんご' },
        { name: 'ゴリラ', kana: 'ごりら' },
        { name: 'スイカ', kana: 'すいか' },
      ];
      const bot = new SiritoriBot(wordList);
      bot.answer('りんご');
      const state = bot.answer('スイカ');
      assert.deepStrictEqual(state, { type: 'violated', reason: 'illegal' });
    });
  });
});
