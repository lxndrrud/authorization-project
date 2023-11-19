export class UpdateTokensResponseDto {
  constructor(
    public access: string,
    public refresh: string,
  ) {}
}
