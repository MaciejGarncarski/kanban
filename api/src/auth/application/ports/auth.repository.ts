export interface AuthRepository {
  register(): Promise<boolean>;
}
