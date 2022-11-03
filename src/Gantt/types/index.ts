export type EdgeType = 'left' | 'right' | 'middle';

export type GruopItem = {
  id: string;
  groupName: string;
  treeIds: string[];
  relations: Record<string, string[]>;
};

export type NodeItemType = {
  id: string;
  title: string;
  percent: number;
  color?: string;
  begin_at: number;
  end_at: number;
  operable?: boolean;
};
