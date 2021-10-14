import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { SiritoriBot } from '../src/lib/SiritoriBot';

test('最後の文字から始まる単語があると続く', () => {
  const wordList = [
    { name: 'りんご', kana: 'りんご' },
    { name: 'ゴリラ', kana: 'ごりら' },
  ];
  const bot = new SiritoriBot(wordList);
  const state = bot.answer('りんご');
  assert.equal(state, { type: 'continued', word: wordList[1] });
});

test('「ん」で終わる単語しかなくなると勝つ', () => {
  const wordList = [
    { name: 'くるみ', kana: 'くるみ' },
    { name: 'みかん', kana: 'みかん' },
  ];
  const bot = new SiritoriBot(wordList);
  const state = bot.answer('くるみ');
  assert.equal(state, { type: 'ended', winner: 'user' });
});

test('「ん」で終わる単語を答えると負ける', () => {
  const wordList = [{ name: 'みかん', kana: 'みかん' }];
  const bot = new SiritoriBot(wordList);
  const state = bot.answer('みかん');
  assert.equal(state, { type: 'ended', winner: 'bot' });
});

test('知らない単語を答えると違反になる', () => {
  const bot = new SiritoriBot([]);
  const state = bot.answer('りんご');
  assert.equal(state, { type: 'violated', reason: 'unknown' });
});

test('すでに使われた単語を答えると違反になる', () => {
  const wordList = [{ name: '新聞紙', kana: 'しんぶんし' }];
  const bot = new SiritoriBot(wordList);
  bot.answer();
  const state = bot.answer('新聞紙');
  assert.equal(state, { type: 'violated', reason: 'duplicated' });
});

test('最後の文字から始まらない単語を答えると違反になる', () => {
  const wordList = [
    { name: 'りんご', kana: 'りんご' },
    { name: 'ゴリラ', kana: 'ごりら' },
    { name: 'スイカ', kana: 'すいか' },
  ];
  const bot = new SiritoriBot(wordList);
  bot.answer('りんご');
  const state = bot.answer('スイカ');
  assert.equal(state, { type: 'violated', reason: 'illegal' });
});

test.run();
