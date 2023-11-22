export interface TextInputProps {
  name: string;
  placeholder?: string;
  maxLength?: number;
  value: string;
  onChange: (event) => void;
  label: string;
}
