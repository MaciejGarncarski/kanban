export interface ProfanityCheckPort {
  isProfane(text: string): Promise<boolean>;
}
