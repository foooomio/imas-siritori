import { Bubble } from '@chatui/core';
import { ExternalLink } from './ExternalLink';
import type { Idol } from '../lib/ImasSiritori';

export const IdolBubble = ({ idol }: { idol: Idol }) => {
  const content = (
    <ExternalLink href={idol.url}>
      {idol.name}（{idol.kana}）
    </ExternalLink>
  );
  return <Bubble content={content} />;
};

export const TweetBubble = ({
  count,
  winner,
}: {
  count: number;
  winner: 'user' | 'bot';
}) => {
  const winOrLose = winner === 'user' ? '勝ちました' : '負けました';
  const text = `${count}人目のアイドルでBotに${winOrLose}。`;

  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('url', 'https://imas-siritori.pikopikopla.net');
  url.searchParams.set('text', `${text} #アイマスしりとり`);

  const content = (
    <ExternalLink href={url.toString()}>Twitterでシェアする</ExternalLink>
  );
  return <Bubble content={content} />;
};

export const HelpBubble = () => {
  const content = (
    <>
      【遊び方】
      <br />
      アイドルマスターのアイドルの名前でBotとしりとりで勝負！
      <br />
      入力は漢字でもひらがなでもOK！
      <br />
      <br />
      ご意見・ご要望は、
      <ExternalLink href="https://twitter.com/foooomio">@foooomio</ExternalLink>
      まで。
      <br />
      <br />
      ソースコードは、GitHubで公開しています。
      <br />
      <ExternalLink href="https://github.com/foooomio/imas-siritori">
        foooomio/imas-siritori
      </ExternalLink>
    </>
  );
  return <Bubble content={content} />;
};
