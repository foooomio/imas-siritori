import { SiritoriBot, SiritoriState, SiritoriWord } from './SiritoriBot';

export interface Idol extends SiritoriWord {
  readonly brand: string;
  readonly url?: string;
}

export type ImasSiritoriState = SiritoriState<Idol>;

export class ImasSiritori {
  private bot!: SiritoriBot<Idol>;

  public constructor(private readonly idols: readonly Idol[]) {}

  public play(brands?: readonly string[]): ImasSiritoriState {
    const wordList = brands
      ? this.idols.filter((idol) => brands.includes(idol.brand))
      : this.idols;
    this.bot = new SiritoriBot<Idol>(wordList);
    return this.bot.answer();
  }

  public answer(text: string): ImasSiritoriState {
    return this.bot.answer(text.normalize('NFKC'));
  }

  public giveUp(): readonly Idol[] {
    return this.bot.findCandidates();
  }

  public count(): number {
    return this.bot.count;
  }
}
