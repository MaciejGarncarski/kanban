export interface AuthRepositoryPort {
  register(): Promise<boolean>;
}
