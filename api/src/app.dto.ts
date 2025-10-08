export class UserDto {
  id: number;
  name: string;
}

export class UsersResponseDto {
  status: string;
  data: {
    users: UserDto[];
  };
}
