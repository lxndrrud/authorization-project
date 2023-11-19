export class LoginUserResponseDto {
  constructor(
    public access: string,
    public refresh: string,
  ) {}
}
