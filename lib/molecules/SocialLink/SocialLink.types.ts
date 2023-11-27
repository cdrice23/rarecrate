export type SocialLinkData = {
  platform: string;
  username: string;
};

export interface SocialLinkProps {
  data: SocialLinkData;
  index: number;
  onEdit: (index: any, setIsEditing?: (value: any) => void) => void;
  onRemove: (index: number) => void;
  isEditing: boolean;
  onConfirm: (index: number) => void;
  hasUsername: string[];
  onUpdateValue: (
    index: number,
    field: string,
    value: string,
    setValues?: (value: any) => void,
    setFieldValue?: (value: any) => void,
  ) => void;
  setValues: (values) => void;
  setIsEditing: (isEditing: any) => void;
}
