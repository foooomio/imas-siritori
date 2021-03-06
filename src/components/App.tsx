import { useEffect, useRef } from 'react';
import Chat, {
  Bubble,
  useMessages,
  MessageProps,
  QuickReplyItemProps,
} from '@chatui/core';
import { ImasSiritori, ImasSiritoriState } from '../lib/ImasSiritori';
import { IdolBubble, TweetBubble, HelpBubble } from './Bubble';

const defaultMessages: Omit<MessageProps, '_id'>[] = [
  {
    type: 'system',
    content: {
      text: 'このアプリは非公式であり、株式会社バンダイナムコエンターテインメント様および関係各社様とは一切関係ありません。',
    },
  },
  {
    type: 'system',
    content: {
      text: 'Powered by im@sparql',
    },
  },
];

const quickReplies: QuickReplyItemProps[] = [
  { name: 'ニューゲーム' },
  { name: 'ギブアップ' },
  { name: 'ヘルプ' },
];

export const App = () => {
  const { messages, appendMsg, setTyping } = useMessages(defaultMessages);
  const imasSiritori = useRef<ImasSiritori | null>(null);

  useEffect(() => {
    fetch('/idols.json')
      .then((res) => res.json())
      .then((json) => {
        imasSiritori.current = new ImasSiritori(json);
        const state = imasSiritori.current.play();
        handleSiritoriState(state);
      })
      .catch(() => {
        appendMsg({
          type: 'text',
          content: { text: 'アイドルの情報を取得できませんでした。' },
        });
      });
  }, []);

  function handleSiritoriState(state: ImasSiritoriState) {
    switch (state.type) {
      case 'continued':
        appendMsg({
          type: 'idol',
          content: { idol: state.word },
        });
        break;
      case 'ended':
        const winner = state.winner === 'user' ? 'あなた' : 'Bot';
        appendMsg({
          type: 'text',
          content: { text: `${winner}の勝ち！` },
        });
        appendMsg({
          type: 'share',
          content: {
            count: imasSiritori.current!.count(),
            winner: state.winner,
          },
        });
        break;
      case 'violated':
        let text: string;
        switch (state.reason) {
          case 'illegal':
            text = '最後の文字から始まっていません。';
            break;
          case 'duplicated':
            text = 'すでに使われています。';
            break;
          case 'unknown':
            text = 'そのようなアイドルは登録されていません。';
            break;
        }
        appendMsg({
          type: 'text',
          content: { text },
        });
        break;
    }
  }

  function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setTyping(true);

      setTimeout(() => {
        switch (val) {
          case 'ギブアップ':
            const candidates = imasSiritori.current!.giveUp();
            if (candidates.length) {
              const idols = candidates.map((idol) => idol.name);
              appendMsg({
                type: 'text',
                content: { text: `${idols.join('、')}がいました。` },
              });
            } else {
              appendMsg({
                type: 'text',
                content: {
                  text: '最後の文字から始まる名前のアイドルはいませんでした。',
                },
              });
            }
            appendMsg({
              type: 'share',
              content: { count: imasSiritori.current!.count(), winner: 'bot' },
            });
            break;
          case 'ニューゲーム':
            const state = imasSiritori.current!.play();
            handleSiritoriState(state);
            break;
          case 'ヘルプ':
            appendMsg({ type: 'help', content: undefined });
            break;
          default:
            handleSiritoriState(imasSiritori.current!.answer(val));
            break;
        }
      }, 500);
    }
  }

  function renderMessageContent({ type, content }: MessageProps) {
    switch (type) {
      case 'idol':
        return <IdolBubble idol={content.idol} />;
      case 'share':
        return <TweetBubble count={content.count} winner={content.winner} />;
      case 'help':
        return <HelpBubble />;
      case 'text':
        return <Bubble content={content.text} />;
    }
  }

  function handleQuickReplyClick(item: QuickReplyItemProps) {
    handleSend('text', item.name);
  }

  return (
    <Chat
      locale="ja-JP"
      navbar={{ title: 'アイマスしりとり' }}
      placeholder="テキストを入力"
      messages={messages}
      renderMessageContent={renderMessageContent}
      quickReplies={quickReplies}
      onQuickReplyClick={handleQuickReplyClick}
      onSend={handleSend}
    />
  );
};
