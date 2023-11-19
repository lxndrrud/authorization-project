export class GetUserInfoResponseDto {
  constructor(
    public email: string,
    public firstname: string,
    public patronymic: string | null,
    public lastname: string,
  ) {}
}
