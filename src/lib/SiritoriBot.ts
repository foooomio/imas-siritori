const random = <T>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export interface SiritoriWord {
  readonly name: string;
  readonly kana: string;
}

export type SiritoriState<Word extends SiritoriWord> =
  | { type: 'continued'; word: Word }
  | { type: 'ended'; winner: 'user' | 'bot' }
  | { type: 'violated'; reason: 'illegal' | 'duplicated' | 'unknown' };

export class SiritoriBot<Word extends SiritoriWord = SiritoriWord> {
  private readonly history: Word[] = [];

  public constructor(private readonly wordList: readonly Word[]) {}

  public get lastWord(): Word | undefined {
    return this.history[this.history.length - 1];
  }

  public get count(): number {
    return this.history.length;
  }

  public answer(text?: string): SiritoriState<Word> {
    if (!text) {
      if (this.history.length) {
        return { type: 'violated', reason: 'illegal' };
      } else {
        const next = random(this.findCandidates());
        this.history.push(next);
        return { type: 'continued', word: next };
      }
    }

    const word = this.findByName(text) || this.findByKana(text);

    if (!word) {
      return { type: 'violated', reason: 'unknown' };
    }

    if (this.isUsed(word)) {
      return { type: 'violated', reason: 'duplicated' };
    }

    if (this.isIllegal(word)) {
      return { type: 'violated', reason: 'illegal' };
    }

    if (word.kana.endsWith('ん')) {
      return { type: 'ended', winner: 'bot' };
    }

    this.history.push(word);

    const candidates = this.findCandidates();

    if (candidates.length === 0) {
      return { type: 'ended', winner: 'user' };
    }

    const next = random(candidates);

    this.history.push(next);

    return { type: 'continued', word: next };
  }

  public findCandidates(): readonly Word[] {
    let candidates = this.wordList;

    if (this.lastWord) {
      const firstKana = this.lastWord.kana.slice(-1);
      candidates = this.findByFirstKana(firstKana);
    }

    return candidates.filter(
      (word) => !word.kana.endsWith('ん') && !this.isUsed(word)
    );
  }

  public findByName(name: string): Word | undefined {
    return this.wordList.find((word) => word.name === name);
  }

  public findByKana(kana: string): Word | undefined {
    return this.wordList.find((word) => word.kana === kana);
  }

  public findByFirstKana(firstKana: string): readonly Word[] {
    return this.wordList.filter((word) => word.kana.startsWith(firstKana));
  }

  public isUsed(word: Word): boolean {
    return this.history.some((used) => used.kana === word.kana);
  }

  public isIllegal(word: Word): boolean {
    return !!this.lastWord && !this.lastWord.kana.endsWith(word.kana.charAt(0));
  }
}
