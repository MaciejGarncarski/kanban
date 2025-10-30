export interface BoardWithRelations {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  createdAt: Date | null;
  columns: {
    id: string;
    boardId: string;
    name: string;
    position: number;
    createdAt: Date | null;
    cards: {
      id: string;
      columnId: string;
      title: string;
      description: string | null;
      position: number;
      createdAt: Date | null;
    }[];
  }[];
}
